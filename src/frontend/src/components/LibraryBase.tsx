import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Header from "./Header";
import { mylakes } from "../types/api.types";
import { getMyLakes, sendFeatureRecentResult } from "../services/api/lake.service";
import { APP_STRINGS } from "../constants/strings";
import { Dialog } from "@mui/material";
import App from "@/App";
import { useLakePulse } from "../context/LakePulseContext";

//libraryData DTO
interface LibraryData {
  userEmail: string;
  featureId: string;
  category: string;
  label: string;
  units: string;
  dataType: string;
  orderInCategory: number;
  description: string;
  recentResult: string;
  editable: number;
  value: string;
  dataSource: string;
  decimalRounding: number;
  allowedCategories: string;
  lowerBound: number;
  upperBound: number;
}

interface LibraryBaseProps {
  title: string;
  categoryId: string;
}

const LibraryBase: React.FC<LibraryBaseProps> = ({ title, categoryId }) => {
  const [libraryData, setLibraryData] = useState<LibraryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<LibraryData[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
 
  const { lakes, userRole } = useLakePulse();
  // At the top of your component, after getting lakes and userRole:
const lastViewedLakeId = localStorage.getItem("lastViewedLake");
const superAdminLake =
  userRole === "Super Admin"
    ? lakes.find(lake => String(lake.lakePulseId) === String(lastViewedLakeId))
    : lakes[0];
  //page description 
  const getPageDescription = (title: string): string => {
    switch (title) {
      case "Physical":
        return "Includes size, depth, volume, shoreline complexity, elevation, water level fluctuations, ice cover, evaporation, and sediment composition, all essential for understanding lake hydrology and structure";
      case "Chemical":
        return "Includes water quality parameters such as pH, dissolved oxygen, nutrients, and contaminants that affect lake ecosystem health";
      case "Biological":
        return "Encompasses flora and fauna, including fish populations, aquatic plants, and microscopic organisms";
      case "Hydrological":
        return "Covers water movement, inflows, outflows, and circulation patterns within the lake";
      case "Watershed":
        return "Details about the surrounding land area that drains into the lake, including land use and soil types";
      case "Weather":
        return "Local climate conditions, precipitation patterns, and atmospheric influences on the lake";
      case "Access":
        return "Information about lake accessibility, public access points, and facilities";
      default:
        return "";
    }
  };

  //fetch library date
  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const lakePulseId = localStorage.getItem("lastViewedLake");
        if (!lakePulseId) {
          throw new Error(APP_STRINGS.NO_LAKES_SELECTED);
        }
        const tokenData = localStorage.getItem("idToken");
        if (!tokenData) {
          throw new Error(APP_STRINGS.AUTH_ERROR.NO_TOKEN);
        }
        const token = JSON.parse(tokenData).id_token;
        const response = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/features-data/get-features-by-category?lakeId=${lakePulseId}&category=${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(APP_STRINGS.FAILED_TO_FETCH);
        }

        const data = await response.json();
        
        setLibraryData(data);
        setEditedData(data); // Initialize editedData with the current libraryData
      } catch (err) {
        console.error(APP_STRINGS.LIBRARY_DATA_ERROR, err);
        setError(
          err instanceof Error ? err.message : APP_STRINGS.FAILED_TO_FETCH
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, [categoryId]);

  // Edit click method to show dialog
  const handleEditClick = () => {
    if (isEditing) {
      setShowDialog(true);
    } else if (userRole === "Super Admin") {
      setIsEditing(true);
      setIsActive(true);
    }
  };
  // Save click method
  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };
  // handle input change event
  const handleInputChange = (e, featureId, field) => {
    let value = e.target.value;
    const item = editedData.find(dataItem => dataItem.featureId === featureId);
    if (item) {
      if (item.dataType === 'date') {
        // Handle date input by converting it to the expected format with time
        const dateParts = value.split('-');
        if (dateParts.length === 3) {
          value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]} 00:00:00`;
        }
      } else if (['integer', 'decimal', 'float'].includes(item.dataType)) {
        const numericValue = parseFloat(value);
        if ((item.lowerBound !== null && numericValue < item.lowerBound) ||
            (item.upperBound !== null && numericValue > item.upperBound)) {
          return; // Do not update state if value is out of bounds
        }
      }
    }
    setEditedData((prevData) =>
      prevData.map((item) =>
        item.featureId === featureId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDialogYes = () => {
    setEditedData(libraryData); // Reset editedData to original libraryData
    setIsEditing(false);
    setShowDialog(false);
  };

  const handleDialogNo = () => {
    setShowDialog(false);
  };

  const formatDateTime = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };
  const handleSaveDialogUpdate = async () => {
    setIsUpdating(true); // Start loading

    const lakePulseId = localStorage.getItem("lastViewedLake");
    if (!lakePulseId) {
      console.error(APP_STRINGS.NO_LAKES_SELECTED);
      return;
    }

    const userProfileStr = localStorage.getItem("currentUserProfile");
    const userEmail = userProfileStr ? JSON.parse(userProfileStr).email : "";
    const tokenData = localStorage.getItem("idToken");
    if (!tokenData) {
      console.error(APP_STRINGS.AUTH_ERROR.NO_TOKEN);
      return;
    }
   
    // Filter only the changed items
    const requestBody = editedData
      .filter((item) => {
        const originalItem = libraryData.find(
          (libItem) => libItem.featureId === item.featureId
        );
        return originalItem && originalItem.recentResult !== item.recentResult;
      })
      .map((item) => {
        let updatedValue: string | number | Date = item.recentResult;

        // Handle different data types
        switch (item.dataType) {
          case "categorical":
            updatedValue = updatedValue;
            break;
          case "decimal":
          case "float":
            updatedValue = parseFloat(updatedValue);
            break;
          case "integer":
            updatedValue = parseInt(updatedValue, 10);
            break;
          case "date":
            if (item.dataType === "date") {
              const dateTimeParts = updatedValue.split(" ");
              const dateParts = dateTimeParts[0].split("-");
              const timeParts = dateTimeParts[1].split(":");
              if (dateParts.length === 3 && timeParts.length === 3) {
                updatedValue = new Date(
                  Date.UTC(
                    parseInt(dateParts[2], 10), // year
                    parseInt(dateParts[1], 10) - 1, // month (0-based index)
                    parseInt(dateParts[0], 10), // day
                    parseInt(timeParts[0], 10), // hours
                    parseInt(timeParts[1], 10), // minutes
                    parseInt(timeParts[2], 10) // seconds
                  )
                ).toISOString();
              }
            }
            break;
          default:
            break;
        }
        return {
          userEmail,
          lakeId: lakePulseId,
          fieldId: item.featureId,
          dataType: item.dataType,
          dataSource: item.dataSource,
          previousValue:
            libraryData.find((libItem) => libItem.featureId === item.featureId)
              ?.recentResult || "",
          updatedValue: updatedValue,
        };
      });

    if (requestBody.length === 0) {
      setShowSaveDialog(false);
      setIsEditing(false);
      return;
    }


    // Send the request to the server
    try {
      await sendFeatureRecentResult(requestBody);
      // Update libraryData and editedData with the new values

      const updatedLibraryData = libraryData.map((item) => {
        const updatedItem = requestBody.find(
          (reqItem) => reqItem.fieldId === item.featureId
        );
        if (updatedItem) {
          let updatedValue = updatedItem.updatedValue;
          // Check if updatedValue is a valid date string
          if (item.dataType === "date") {
            const parsedDate = new Date(updatedValue);
            if (!isNaN(parsedDate.getTime())) {
              updatedValue = formatDateTime(parsedDate);
            } else {
              updatedValue = updatedValue.toString();
            }
          } else {
            updatedValue = updatedValue.toString();
          }
          return { ...item, recentResult: updatedValue };
        }
        return item;
      });
      setEditedData(updatedLibraryData);
      setLibraryData(updatedLibraryData);
      setShowSaveDialog(false);
      setIsEditing(false);
      setIsActive(false);
    } catch (error) {
      console.error(APP_STRINGS.FAILED_TO_FETCH, error);
    } finally {
      setIsUpdating(false); // End loading
    }
  };

  const handleSaveDialogCancel = () => {
    setShowSaveDialog(false);
  };

  const renderInputField = (item, field) => {
    const {
      dataType,
      decimalRounding,
      allowedCategories,
      lowerBound,
      upperBound,
    } = item;

    // Check if an edited value exists, otherwise use the default value
    const editedItem = editedData.find(
      (dataItem) => dataItem.featureId === item.featureId
    );
    const value = editedItem ? editedItem[field] : item[field];

    // Ensure value is not null or undefined before processing
    const safeValue = value || "";

    switch (dataType) {
      case "decimal":
      case "float":
        return (
          <input
            type="number"
            step={decimalRounding ? Math.pow(10, -decimalRounding) : "any"}
            value={
              safeValue !== ""
                ? parseFloat(safeValue).toFixed(decimalRounding)
                : ""
            }
            onChange={(e) => handleInputChange(e, item.featureId, field)}
            min={lowerBound !== null ? lowerBound : undefined}
            max={upperBound!== null ? upperBound : undefined}
          />
        );
      case "integer":
        return (
          <input
            type="number"
            step="1"
            value={safeValue !== "" ? parseInt(safeValue, 10) : ""}
            onChange={(e) => handleInputChange(e, item.featureId, field)}
            min={lowerBound !== null ? lowerBound : undefined}
            max={upperBound !== null ? upperBound : undefined}
          />
        );
         case "categorical":
  const categories = allowedCategories
    ? allowedCategories.split(",").map((category) => category)
    : [];
  const selectedCategory = safeValue || ""; // safeValue is "" initially

  return (
    <select
      value={selectedCategory}
      onChange={(e) => handleInputChange(e, item.featureId, field)}
    >
      <option value="" disabled>
        Y?N
      </option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
      case "date":
        let formattedDate = "";
        if (safeValue && safeValue.includes(" ")) {
          const dateParts = safeValue.split(" ")[0].split("-");
          const timeParts = safeValue.split(" ")[1].split(":");
          const parsedDate = new Date(
            Date.UTC(
              parseInt(dateParts[2], 10), // year
              parseInt(dateParts[1], 10) - 1, // month (0-based index)
              parseInt(dateParts[0], 10), // day
              parseInt(timeParts[0], 10), // hours
              parseInt(timeParts[1], 10), // minutes
              parseInt(timeParts[2], 10) // seconds
            )
          );
          formattedDate = !isNaN(parsedDate.getTime())
            ? new Date(
                parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000
              ).toISOString().split("T")[0] : "";
        }
        return (
          <input
            type="date"
            value={formattedDate}
            onChange={(e) => handleInputChange(e, item.featureId, field)}
          />
        );
      case "text":
      default:
        return (
          <input
            type="text"
            value={safeValue || ""}
            onChange={(e) => handleInputChange(e, item.featureId, field)}
          />
        );
    }
  };
// Render recent result based on data type
  const renderRecentResult = (recentResult, dataType, decimalRounding) => {
    const roundValue = (num, decimalPlaces) => {
      return Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    };

    // Convert recentResult to a number if it's a valid float or decimal
    const numericValue = parseFloat(recentResult);

    return (
      <>
        {dataType === 'float' || dataType === 'decimal' 
          ? !isNaN(numericValue) 
            ? roundValue(numericValue, decimalRounding === 1 ? 1 : 6)
            : recentResult
          : recentResult
          
          }
           
      </>
    );
  };

  return (
    <div>
     
      <main>
        <div className="library-container">
          <div className="library-header">
            <div className="library-subheader">
              <h1>{APP_STRINGS.LIBRARY_TITLE}</h1>
              {userRole === "Super Admin" && (
                <div className="action-items">
                  <button
                    className={`action-btn edit ${isActive ? "active" : ""}`}
                    onClick={handleEditClick}
                  >
                    <i className="fa-thin fa-pencil"></i>
                  </button>
                  <button
                    className={`action-btn save ${isActive ? "active" : ""}`}
                    onClick={handleSaveClick}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-thin fa-floppy-disk"></i>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="page-description">
              <h2>
                {title === APP_STRINGS.PHYSICAL && (
                  <>
                    <i
                      className="fa-thin fa-earth-americas"
                      aria-hidden="true"
                    ></i>
                  </>
                )}
                {title == APP_STRINGS.CHEMICAL && (
                  <>
                    {" "}
                    <i className="fa-thin fa-flask" aria-hidden="true"></i>
                  </>
                )}
                {title == APP_STRINGS.BIOLOGICAL && (
                  <>
                    {" "}
                    <i className="fa-thin fa-dna" aria-hidden="true"></i>
                  </>
                )}
                {title == APP_STRINGS.HYDROLOGICAL && (
                  <>
                    <i className="fa-thin fa-tank-water" aria-hidden="true"></i>
                  </>
                )}
                {title == APP_STRINGS.WATERSHED && (
                  <>
                    <i className="fa-thin fa-water" aria-hidden="true"></i>
                  </>
                )}
                {/* NOTE: This is commented maybe used in future */}
                {/* {title == "Weather" && (
                  <>
                    {" "}
                    <i className="fa-thin fa-sun-cloud" aria-hidden="true"></i>
                  </>
                )} */}
                {title == APP_STRINGS.ACCESS && (
                  <>
                    <i
                      className="fa-thin fa-umbrella-beach"
                      aria-hidden="true"
                    ></i>
                  </>
                )}
                {title}
              </h2>
              {getPageDescription(title)}
            </div>
          </div>
          {loading && <div className="loading">{APP_STRINGS.LOADING}</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <div className="library-table-container">
              <table className="library-table">
                <thead>
                  <tr>
                    <th>{APP_STRINGS.ITEM}</th>
                    <th className="metric">{APP_STRINGS.AVERAGE_ITEM}</th>
                    <th>{APP_STRINGS.MEASUREMENT}</th>
                    <th>{APP_STRINGS.DESCRIPTION}</th>
                  </tr>
                </thead>
                <tbody>
                  {editedData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.label ? item.label : "-"}</td>
                      <td className="metric">
                        {isEditing && item.editable === 1
                          ? renderInputField(item, "recentResult")
                          : item.dataType === "date" && item.recentResult
                          ? item.recentResult.split(" ")[0]
                          : renderRecentResult(item.recentResult, item.dataType, item.decimalRounding)
                          }
                      </td>
                      <td>{item.units ? item.units : "-"}</td>
                      <td>{item.description ? item.description : "_"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="metric-note">
               {APP_STRINGS.METRIC_NOTE}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={showDialog}
        onClose={handleDialogNo}
        PaperProps={{
          style: {
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
          },
        }}
      >
        <div className="confirmation-dialog checkout-dialog">
          <p>{APP_STRINGS.ARE_YOU_SURE}</p>
          <div className="dialog-buttons">
            <button onClick={handleDialogYes} className="proceed-button">
              {APP_STRINGS.YES}
            </button>
            <button onClick={handleDialogNo} className="cancel-button">
              {APP_STRINGS.NO}
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showSaveDialog}
        onClose={handleSaveDialogCancel}
        PaperProps={{
          style: {
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "560px",
            width: "90%",
          },
        }}
      >
        <div className="confirmation-dialog checkout-dialog">
          <h2>{APP_STRINGS.IMPORTANT}</h2>
          <p>
            {APP_STRINGS.ABOUT_UPDATE}{" "}
            <strong>
              {APP_STRINGS.NAV_LIBRARY} - {title}
            </strong>{" "}
            {APP_STRINGS.DATA_FOR} <strong>{superAdminLake?.lakeName}</strong>{" "}
{APP_STRINGS.IN} {superAdminLake?.lakeCounty}, {superAdminLake?.lakeState}
            .
          </p>
          <p>{APP_STRINGS.PLEASE_NOTE_ALL_DATA}</p>
          <div className="dialog-buttons">
            <button onClick={handleSaveDialogCancel} className="cancel-button">
              {APP_STRINGS.CANCEL}
            </button>
            <button
              onClick={handleSaveDialogUpdate}
              className="proceed-button"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <i className="fa fa-spinner fa-spin"></i>
              ) : (
                APP_STRINGS.UPDATE
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LibraryBase;
