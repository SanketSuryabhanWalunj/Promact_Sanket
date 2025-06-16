import React, { useState, useEffect } from 'react';
import { TextField, IconButton, Button, Dialog, DialogContent, DialogTitle, DialogActions, TextareaAutosize } from '@mui/material';
import { Delete, GridView, List } from '@mui/icons-material';
import { FileUploader } from "react-drag-drop-files";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import '../styles/common.css';
import moment from 'moment';
import Header from '../components/Header';
import { mylakes } from "../types/api.types";
import { getMyLakes } from "../services/api/lake.service";
import { APP_STRINGS } from "../constants/strings";
import { CircularProgress } from '@mui/material'; // Import loader component
import { data } from 'react-router-dom';
import FileUploadDialog from '../components/FileUploadDialog';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useLakePulse } from '../context/LakePulseContext';

interface FileItem {
    id: number;
    fileName: string;
    dataSourceType: string;
    label: string;
    reportDate: string;
    comment: string;
    lakePulseId?: string; // Make lakePulseId optional
    userId?: string;
    fileIcon?: string;
    file?: File; // Add optional file property
}



const Satellite: React.FC = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [tempFiles, setTempFiles] = useState<FileItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showDragDrop, setShowDragDrop] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: '',
        end: '',
    });
  
  
    const [loading, setLoading] = useState(true); // Add loading state
    const dataSourceType = "satelite"; // Fixed for the historical page
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState<string | null>(null);
    const [sortField, setSortField] = useState<string>('filename'); // Default sort field
    const [sortDirection, setSortDirection] = useState<string>('asc'); // Default sort direction
  const { lakes, userRole } = useLakePulse();
    // Fetch user role and lakes
 

    // Common function to get authentication token
    const getAuthToken = (): { userId: string; idToken: string } => {
        const userDataStr = localStorage.getItem("idToken");
        if (!userDataStr) {
            console.error("No authentication token found. Redirecting to login...");
            window.location.href = "/login"; // Redirect to login page
            throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
        }

        const userData = JSON.parse(userDataStr);
        const idToken = userData.id_token;
        const userId = userData.profile?.sub || userData.profile?.["cognito:username"];

        if (!idToken || !userId) {
            console.error("Invalid authentication token. Redirecting to login...");
            window.location.href = "/login"; // Redirect to login page
            throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
        }

        return { userId, idToken };
    };

    // Fetch files from the S3 bucket

    const fetchFiles = async (searchTerm = '', fromDate = '', toDate = '') => {

        setLoading(true); // Start the loader before fetching files
        let lakePulseId: number | null = null;

    if (userRole === 'Super Admin') {
      lakePulseId = Number(localStorage.getItem("lastViewedLake"));
    } else {
      lakePulseId = lakes[0]?.lakePulseId || null;
    }

    const { idToken } = getAuthToken();
    const fromDateUtc = fromDate ? new Date(fromDate).toISOString() : '';
    const toDateUtc = toDate ? new Date(toDate).toISOString() : '';

    try {
      const queryParams = new URLSearchParams({
        lakePulseId: lakePulseId?.toString() ?? '',
        dataSourceType,
        searchTerm,
        fromDate: fromDateUtc,
        toDate: toDateUtc,
        sortBy: sortField, // Use the selected sort field
        sortDirection, // Use the selected sort direction
        pageNumber: "1",
        pageSize: "100",
      }).toString();

            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/data-source/documents?${queryParams}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Accept': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                const fetchedFiles = result.map((file: any, index: number) => ({
                    id: index,
                    fileName: file.fileName,
                    dataSourceType: file.dataSourceType,
                    label: file.label || '',
                    reportDate: file.reportDate ? new Date(file.reportDate).toLocaleString() : '',
                    comment: file.comment || '',
                    fileIcon: getFileIcon(file.fileName),
                }));
                setFiles(fetchedFiles);
            } else {
                console.error(APP_STRINGS.FAILED_TO_FETCH, response.statusText);
            }
        } catch (error) {
            console.error(APP_STRINGS.FAILED_TO_FETCH, error);
        } finally {
            setLoading(false); // Stop the loader after fetching files
        }
    };

    // Determine the icon based on the file type
    const getFileIcon = (fileName: string) => {
        const fileType = fileName.split('.').pop()?.toLowerCase() || 'unknown';
        if (fileType === 'pdf') return 'fas fa-file-pdf';
        if (['jpg', 'jpeg', 'png'].includes(fileType)) return 'fas fa-file-image';
        if (['xlsx', 'xls'].includes(fileType)) return 'fas fa-file-excel';
        return 'fas fa-file';
    };

    useEffect(() => {
        if (lakes.length > 0) {
            fetchFiles(); // Fetch files only if lakeData is available
        }
    }, [lakes]);



    const handleSave = async (files: FileItem[], dataSourceType: string) => {
        // Prepare the metadata for the files
        const dataSourceFilesDetails = files.map((file) => ({
            fileName: file.fileName,
            dataSourceType: file.dataSourceType,
            label: file.label,
            comment: file.comment,
            lakePulseId: file.lakePulseId,
            reportDate: file.reportDate,
            userId: file.userId,
        }));



        // Create FormData and append metadata
        const formData = new FormData();
        formData.append('dataSourceFilesDetailsJson', JSON.stringify(dataSourceFilesDetails));

        // Append files to FormData
        files.forEach((file) => {
            if (file.file?.size > 0) {
                formData.append('files', file.file);
            }
        });

        // API call to upload files
        const { idToken } = getAuthToken();

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/data-source/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                fetchFiles();
            }
        } catch (error) {
            console.error(APP_STRINGS.ERROR_ALERT_CLASS, error);
        }
    };
    const handleDownload = async (fileName: string, dataSourceType: string) => {
        const { idToken } = getAuthToken();

        try {
            // Encode the file name to handle spaces and special characters
            const encodedFileName = encodeURIComponent(fileName);

            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/data-source/download/${encodedFileName}?dataSourceType=${dataSourceType}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName; // Keep the original file name with spaces
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url); // Clean up the URL object
            } else {
                console.error(APP_STRINGS.FAILED_TO_DOWNLOAD, response.statusText);
            }
        } catch (error) {
            console.error(APP_STRINGS.ERROR_DOWNLOADING, error);
        }
    }

    useEffect(() => {
        fetchFiles(searchQuery, dateRange.start, dateRange.end);
    }, [sortField, sortDirection, searchQuery, dateRange]);

    return (
        <div>
          
            <main>
                <div className="main-page-wrap">
                    <div className="historic-container library-table-container">
                        <h1 className='mb-2'>{APP_STRINGS.SOURCES_SATELLITE}</h1>

                        <div className="filters">
                            <TextField
                                placeholder="Search for..."
                                value={searchQuery}
                                onChange={(e) => {
                                    const searchTerm = e.target.value;
                                    setSearchQuery(searchTerm);

                                    // If the search input is cleared, fetch all files

                                    if (searchTerm.trim() === '') {
                                        fetchFiles(''); // Fetch all files when search is cleared
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        fetchFiles(searchQuery); // Trigger search on Enter key press
                                    }
                                }}
                                style={{ marginRight: '10px' }}
                            />
                            <TextField
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => {
                                    const newStartDate = e.target.value;
                                    setDateRange((prev) => ({ ...prev, start: newStartDate }));
                                    fetchFiles(searchQuery, newStartDate, dateRange.end); // Fetch files with updated date range
                                }}
                                style={{ marginRight: '10px' }}
                            />
                            <TextField
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => {
                                    const newEndDate = e.target.value;
                                    setDateRange((prev) => ({ ...prev, end: newEndDate }));
                                    fetchFiles(searchQuery, dateRange.start, newEndDate); // Fetch files with updated date range
                                }}
                                style={{ marginRight: '10px' }}
                            />


                            <FormControl style={{ marginRight: '10px', width: '150px' }}>
                                <InputLabel id="sort-by-label">Sort By</InputLabel>
                                <Select
                                    labelId="sort-by-label"
                                    value={sortField}
                                    onChange={(e) => {
                                        const selectedField = e.target.value;


                                        // Set the correct sort field based on the selected option
                                        setSortField(selectedField);

                                        // Toggle sort direction
                                        setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
                                    }}
                                >
                                    <MenuItem value="filename">{APP_STRINGS.SORT_BY_NAME}</MenuItem>
                                    <MenuItem value="label">{APP_STRINGS.SORT_BY_LABEL}</MenuItem>
                                    <MenuItem value="reportdate">{APP_STRINGS.SORT_BY_DATE}</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                className='theme-button'
                                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                                style={{ marginRight: '10px' }}
                            >
                                {viewMode === 'list' ? <GridView /> : <List />}
                            </Button>
                            <Button
                                variant="contained"
                                className='theme-button'
                                onClick={() => setIsDialogOpen(true)}
                                style={{ marginRight: '10px' }}
                            >
                                {APP_STRINGS.UPLOAD_FILES}
                            </Button>
                            <FileUploadDialog
                                open={isDialogOpen}
                                onClose={() => setIsDialogOpen(false)}
                                onSave={(files, dataSourceType) => {
                                    handleSave(files, dataSourceType); // Call the refactored handleSave method
                                }}
                                dataSourceType={dataSourceType}
                            />
                        </div>

                        {viewMode === 'list' ? (
                            <table className="library-table">
                                <thead>
                                    <tr>
                                        <th>{APP_STRINGS.FILE_NAME}</th>
                                        <th>{APP_STRINGS.TYPE}</th>
                                        <th>{APP_STRINGS.LABEL}</th>
                                        <th>{APP_STRINGS.DATE_TIME}</th>
                                        <th>{APP_STRINGS.COMMENT}</th>
                                        <th>{APP_STRINGS.ACTIONS}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        // Show loader in the table body
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                                <CircularProgress />
                                            </td>
                                        </tr>
                                    ) : (
                                        files.map((file) => (
                                            <tr key={file.id}>
                                                <td>
                                                    <i className={file.fileIcon} style={{ marginRight: '10px' }}></i>
                                                    {file.fileName}
                                                </td>
                                                <td>{file.dataSourceType}</td>
                                                <td>{file.label}</td>
                                                <td>{file.reportDate}</td>
                                                <td>{file.comment || 'No Comment'}</td>
                                                <td>
                                                    <Button
                                                        variant="contained"
                                                        className="theme-button"
                                                        onClick={() => handleDownload(file.fileName, dataSourceType)}
                                                    >
                                                        {APP_STRINGS.DOWNLOAD}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div className="grid-view grid grid-cols-3">
                                {loading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <CircularProgress />
                                    </div>
                                ) : (
                                    files.map((file) => (
                                        <div key={file.id} className="grid-item">
                                            <div className="inline-block">
                                                <div className="file-image">
                                                    <i className={file.fileIcon}></i>
                                                </div>
                                                <div className="inline-block w-70">
                                                    <p>{file.fileName}</p>
                                                    <p>{file.label}</p>
                                                    <p>{file.reportDate}</p>

                                                    <Button
                                                        variant="contained"
                                                        className="theme-button"
                                                        onClick={() => handleDownload(file.fileName, dataSourceType)}
                                                    >
                                                        {APP_STRINGS.DOWNLOAD}
                                                    </Button>
                                                </div>
                                                {file.comment && (
                                                    <div className="comment-ico inline-block w-30">
                                                        <i
                                                            className="fa-solid fa-comment"
                                                            onClick={() => {
                                                                setSelectedComment(file.comment);
                                                                setCommentDialogOpen(true);
                                                            }}
                                                        ></i>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <Dialog
                            open={commentDialogOpen}
                            onClose={() => setCommentDialogOpen(false)}
                            maxWidth="sm"
                            fullWidth
                        >
                            <DialogTitle>{APP_STRINGS.COMMENT}</DialogTitle>

                            <DialogContent>
                                <p>{selectedComment}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setCommentDialogOpen(false)} color="primary">
                                    {APP_STRINGS.CANCEL}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Satellite;