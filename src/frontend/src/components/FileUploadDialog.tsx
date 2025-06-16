import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  TextareaAutosize,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import Datetime from 'react-datetime';
import moment from 'moment';
import { FileUploader } from 'react-drag-drop-files';

import { getMyLakes } from "../services/api/lake.service";
import { APP_STRINGS } from "../constants/strings";
import { useLakePulse } from '../context/LakePulseContext';


// Validation function to disable future dates
const isValidDate = (current: moment.Moment) => {
  return current.isSameOrBefore(moment(), 'day'); // Allow only current and past dates
};
interface FileItem {
  id: number;
  fileName: string;
  dataSourceType: string;
  label: string;
  reportDate: string;
  lakePulseId?: string;
  userId?: string;
  comment: string;
  file: File;
  fileIcon?: string;
}
//file upload dialog props
interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (files: FileItem[], dataSourceType: string) => void;
  dataSourceType: string; // To differentiate between pages
}

//file upload dialog component
const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onClose,
  onSave,
  dataSourceType,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [showDragDrop, setShowDragDrop] = useState(false);
  const [tempFiles, setTempFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
const { lakes, userRole } = useLakePulse();

  // Handle file upload
  const handleFileUpload = (uploadedFiles: File[]) => {
    const allowedImageExtensions = ['png', 'jpg', 'jpeg', 'tif', 'gif'];
    const newFiles = Array.from(uploadedFiles).filter((file) => {
    const fileType = file.type.split('/')[1]?.toLowerCase() || 'unknown';
      // If dataSourceType is "images", validate file extensions
      if (dataSourceType === "images" && !allowedImageExtensions.includes(fileType)) {
        console.error(`${APP_STRINGS.INVALID_FILES} ${file.name}`);
        alert(`${APP_STRINGS.INVALID_FILES}: ${file.name}. ${APP_STRINGS.ALLOWED_FILE_TYPES}`);
        return false;
      }
      return true;
    }).map((file, index) => {
      const fileType = file.type.split('/')[1] || 'unknown';
      let fileIcon = 'fas fa-file'; // Default icon

      // Determine the icon based on the file type
      if (fileType === 'pdf') fileIcon = 'fas fa-file-pdf';
      else if (['jpg', 'jpeg', 'png'].includes(fileType)) fileIcon = 'fas fa-file-image';
      else if (['xlsx', 'xls'].includes(fileType)) fileIcon = 'fas fa-file-excel';

      // Generate a new filename with UTC datetime prefix
      const utcTimestamp = new Date().toISOString().replace(/:/g, '-');
      const newFilename = `${utcTimestamp}_${index}_${file.name}`;
      const renamedFile = new File([file], newFilename, { type: file.type });

      let lakePulseId: string | undefined = undefined;

    if (userRole === 'Super Admin') {
      const lastViewedLake = localStorage.getItem("lastViewedLake");
      lakePulseId = lastViewedLake ? String(lastViewedLake) : undefined;
    } else {
      lakePulseId = lakes[0]?.lakePulseId ? String(lakes[0].lakePulseId) : undefined;
    }

      return {
        id: Date.now() + index,
        fileName: newFilename,
        dataSourceType: dataSourceType,
        label: '',
        reportDate: new Date().toISOString(), // Set default date and time to current
        comment: '',
        lakePulseId: lakePulseId,
        userId: '',
        fileIcon,
        file: renamedFile,
      };
    });

    const validFiles = newFiles.filter((file) => file !== null) as FileItem[];
    setTempFiles((prevFiles) => [...prevFiles, ...validFiles]);
    setShowDragDrop(false);
  };
  // Handle delete file
  const handleDeleteFile = (id: number) => {
    setTempFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };
  // Handle save button click
  const handleSave = () => {
    if (tempFiles.length === 0) {
      console.error(`${APP_STRINGS.NO_FILES_SAVE}`);
      return;
    }
    onSave(tempFiles, dataSourceType);
    setTempFiles([]); // Clear the tempFiles after saving
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{APP_STRINGS.UPLOAD_FILES}</DialogTitle>
      <DialogContent>
        {!showDragDrop ? (
          <Button
            variant="contained"
            className="theme-button"
            onClick={() => setShowDragDrop(true)}
            style={{ marginBottom: '20px' }}
          >
            {APP_STRINGS.BROWSE}
          </Button>
        ) : (
          <div>
            <FileUploader
              multiple
              handleChange={handleFileUpload}
              name="file"
              types={dataSourceType === "images" ? ['png', 'jpg', 'gif', 'tif'] : ['jpg', 'png', 'pdf', 'xlsx']}
              classes="drag-drop-area"
            />
            <p>{APP_STRINGS.DRAG_N_DROP}</p>
          </div>
        )}

        {tempFiles.length > 0 && (
          <table className="library-table">
            <thead>
              <tr>
                <th>{APP_STRINGS.FILE_NAME}</th>
                <th>{APP_STRINGS.LABEL}</th>
                <th>{APP_STRINGS.COMMENT}</th>
                <th>{APP_STRINGS.DATE_TIME}</th>
                <th>{APP_STRINGS.ACTIONS}</th>
              </tr>
            </thead>
            <tbody>
              {tempFiles.map((file) => (
                <tr key={file.id}>
                  <td>{file.fileName}</td>
                  <td>
                    <TextField
                      value={file.label}
                      onChange={(e) =>
                        setTempFiles((prevFiles) =>
                          prevFiles.map((f) =>
                            f.id === file.id ? { ...f, label: e.target.value } : f
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <TextareaAutosize
                      value={file.comment}
                      onChange={(e) =>
                        setTempFiles((prevFiles) =>
                          prevFiles.map((f) =>
                            f.id === file.id ? { ...f, comment: e.target.value } : f
                          )
                        )
                      }
                      style={{
                        height: 60,
                        width: 200,
                        borderColor: 'rgb(0 0 0 / 23%)',
                        borderWidth: 1,
                        borderRadius: 4,
                        padding: 8,
                      }}
                    />
                  </td>
                  <td>
                    <Datetime
                      value={new Date(file.reportDate)}
                      onChange={(newDate) =>
                        setTempFiles((prevFiles) =>
                          prevFiles.map((f) =>
                            f.id === file.id
                              ? {
                                ...f,
                                reportDate: moment.isMoment(newDate)
                                  ? newDate.toISOString()
                                  : new Date(newDate).toISOString(),
                              }
                              : f
                          )
                        )
                      }
                      isValidDate={isValidDate} // Add validation for disabling future dates
                    />
                  </td>
                  <td>
                    <IconButton onClick={() => handleDeleteFile(file.id)}>
                      <Delete />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="cancel-btn">
          {APP_STRINGS.CANCEL}
        </Button>
        <Button onClick={handleSave} className="theme-button">
          {APP_STRINGS.SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;