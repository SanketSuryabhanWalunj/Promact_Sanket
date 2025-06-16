import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import Header from '../components/Header';
import { APP_STRINGS } from '../constants/strings';
import '../styles/common.css';
import { FieldNoteDto, LakeOverview } from '@/types/api.types';
import { addFieldNote, getFieldNotesByLakeId, updateFieldNote, deleteFieldNote, getLakeOverviewById, toggleFieldNoteLike } from '../services/api/lake.service';
import { Pagination } from '../components/common/Pagination';
import { getStoredUserProfile } from '../services/api/user.service';
// Format date for field notes
const formatDate = (dateString: string) => {
  try {
    // Handle ISO date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(APP_STRINGS.INVALID_DATE);
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error(APP_STRINGS.DATE_PARSING_ERROR, dateString);
    return APP_STRINGS.INVALID_DATE;
  }
};

const PAGE_SIZE = 10; // Keep this constant

// field notes results page
const FieldNotesResults: React.FC = () => {
  const { lakePulseId } = useParams<{ lakePulseId: string }>();
  const auth = useAuth();
  const userProfile = getStoredUserProfile();
  
  const userId = userProfile.sub || '';

  const getUserName = () => {
    if (userProfile?.given_name || userProfile?.family_name) {
      return `${userProfile.given_name || ''} ${userProfile.family_name || ''}`.trim();
    }
    return userProfile.given_name || 'Anonymous';
  };

  const currentUser = getUserName();

  const [notes, setNotes] = useState<FieldNoteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [newNote, setNewNote] = useState({ title: '' });
  const [editingNote, setEditingNote] = useState<FieldNoteDto | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [likedStatus, setLikedStatus] = useState<Record<string, number>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [editingReply, setEditingReply] = useState<FieldNoteDto | null>(null);

  const paginatedNotes = () => {
    const parentNotes = notes.filter(note => !note.fieldNoteId);
    const indexOfLastNote = currentPage * 10;
    const indexOfFirstNote = indexOfLastNote - 10;
    return parentNotes.slice(indexOfFirstNote, indexOfLastNote);
  };

    // get level info
// get level info
const getLevelInfo = (levelId: number) => {
  if (levelId === 0) {
    return {
      id: 0,
      levelLabel: "Notification",
      levelColor: "#4caf50" // green
    };
  }
  try {
    const levels = JSON.parse(localStorage.getItem("alertLevels") || "[]");
    return levels.find((lvl: any) => lvl.id === levelId);
  } catch {
    return null;
  }
};

// fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!lakePulseId) return;
      setLoading(true);
      try {
        const response = await getFieldNotesByLakeId(lakePulseId, 1, 10, userId);
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            setNotes(response);
            setTotalCount(response.length);
            // Initialize like status for each note
            const initialLikeStatus = response.reduce((acc, note) => ({
              ...acc,
              [note.id]: note.likeCount > 0 ? 1 : 0
            }), {});
            setLikedStatus(initialLikeStatus);
          }
        }
      } catch (error) {
        console.error(APP_STRINGS.ERROR_FETCHING_NOTES, error);
        setNotes([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [lakePulseId, userId]);

// handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const notesArea = document.querySelector('.notes-scroll-area');
    if (notesArea) {
      notesArea.scrollTop = 0;
    }
  };

// handle reply click
  const handleReplyClick = (noteId: string) => {
    setReplyingTo(noteId);
  };
// handle save new note
  const handleSaveNewNote = async () => {
    if (!newNote.title.trim()) {
      alert(APP_STRINGS.PLEASE_ENTER_A_NOTE);
      return;
    }

    try {
    const userProfile = localStorage.getItem("currentUserProfile")
      const userData = JSON.parse(userProfile);
      const userId = userData?.sub || '';
      const userName = getUserName();

      // Add the new note
      await addFieldNote(userId, userName, lakePulseId!, newNote.title, false, null);
      
      // Clear the input
      setNewNote({ title: '' });

      // Immediately fetch and update the notes list
      const response = await getFieldNotesByLakeId(lakePulseId!, 1, 100, userId);
      if (Array.isArray(response)) {
        setNotes(response);
        setTotalCount(response.length);
        
        // Initialize like status for the new notes
        const initialLikeStatus = response.reduce((acc, note) => ({
          ...acc,
          [note.id]: note.likeCount > 0 ? 1 : 0
        }), {});
        setLikedStatus(initialLikeStatus);

        // Reset to first page to show the new note
        setCurrentPage(1);
      }
    } catch (error) {
      console.error(APP_STRINGS.ERROR_SAVING_NOTE, error);
      alert(APP_STRINGS.ERROR_SAVING_NOTE);
    }
  };

// handle save reply
  const handleSaveReply = async (parentNoteId: string) => {
    const replyContent = replyText[parentNoteId];
    if (!replyContent?.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      const userData = userProfile;
      const userId = userData?.sub || '';
      const userName = getUserName();

      // Reply to note
      await addFieldNote(userId, userName, lakePulseId!, replyContent, true, parentNoteId);
      
      // Clear reply state
      setReplyText(prev => ({ ...prev, [parentNoteId]: '' }));
      setReplyingTo(null);

      // Fetch all notes again and update the state
      const response = await getFieldNotesByLakeId(lakePulseId!, 1, 100, userId);
      if (response && Array.isArray(response)) {
        setNotes(response);
        setTotalCount(response.length);
        // Show the replies for the parent note
        setShowReplies(prev => ({
          ...prev,
          [parentNoteId]: true
        }));
        // Initialize like status for each note
        const initialLikeStatus = response.reduce((acc, note) => ({
          ...acc,
          [note.id]: note.likeCount > 0 ? 1 : 0
        }), {});
        setLikedStatus(initialLikeStatus);
      }
    } catch (error) {
      console.error(APP_STRINGS.ERROR_SAVING_NOTE, error);
      alert(APP_STRINGS.ERROR_SAVING_NOTE);
    }
  };

// handle edit click
  const handleEditClick = (note: FieldNoteDto) => {
    setEditingNote(note);
  };

// handle save edit
  const handleSaveEdit = async () => {
    if (!editingNote) return;

    try {
      const userData = userProfile;
      const userId = userData?.sub || '';
      const userName = getUserName();

      await updateFieldNote(
        userId,
        editingNote.note,
        editingNote.id.toString()
      );

      setEditingNote(null);
      const response = await getFieldNotesByLakeId(lakePulseId!, currentPage, PAGE_SIZE, userId);
      if (Array.isArray(response)) {
        setNotes(response);
        setTotalCount(response.length);
      }
    } catch (error) {
      console.error(APP_STRINGS.ERROR_UPDATING_NOTE, error);
      alert(APP_STRINGS.ERROR_UPDATING_NOTE);
    }
  };

// handle delete click
  const handleDeleteClick = (fieldNoteId: string) => {
    setDeleteConfirmId(fieldNoteId);
  };

// handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const userDataStr = localStorage.getItem('idToken');
      if (!userDataStr) {
        alert(APP_STRINGS.LOGIN_REQUIRED);
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.profile?.sub || userData.profile?.["cognito:username"];

      await deleteFieldNote(userId, deleteConfirmId);
      setDeleteConfirmId(null);

      const response = await getFieldNotesByLakeId(lakePulseId!, currentPage, PAGE_SIZE, userId);
      if (Array.isArray(response)) {
        setNotes(response);
        setTotalCount(response.length);
        if (response.length > 0) {
          setLikedStatus(response.reduce((acc, note) => ({
            ...acc,
            [note.id]: note.likeCount > 0 ? 1 : 0
          }), {}));
        }
      }
    } catch (error) {
      console.error(APP_STRINGS.ERROR_DELETING_NOTE, error);
      alert(APP_STRINGS.ERROR_DELETING_NOTE);
    }
  };



// toggle like
  const toggleLike = async (noteId: string) => {
    try {
      const response = await toggleFieldNoteLike(noteId, userId);
      
      // Update like status
      setLikedStatus(prev => ({
        ...prev,
        [noteId]: response === 1 ? 1 : 0
      }));

      // Immediately update the like count in the notes state
      setNotes(prevNotes => prevNotes.map(note => {
        if (note.id.toString() === noteId) {
          return {
            ...note,
            likeCount: response === 1 ? note.likeCount + 1 : note.likeCount - 1
          };
        }
        return note;
      }));
    } catch (error) {
      console.error(APP_STRINGS.ERROR_TOGGLE_LIKE, error);
    }
  };

// toggle replies
  const toggleReplies = (noteId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

// handle reply edit click
  const handleReplyEditClick = (reply: FieldNoteDto) => {
    setEditingReply(reply);
  };

// handle save reply edit
  const handleSaveReplyEdit = async (reply: FieldNoteDto) => {
    if (!editingReply) return;

    try {
      const userData = userProfile;
      const userId = userData?.sub || '';

      await updateFieldNote(
        userId,
        editingReply.note,
        editingReply.id.toString()
      );

      setEditingReply(null);
      // Refresh notes to show updated reply
      const response = await getFieldNotesByLakeId(lakePulseId!, 1, 100, userId);
      if (Array.isArray(response)) {
        setNotes(response);
        setTotalCount(response.length);
      }
    } catch (error) {
      console.error(APP_STRINGS.ERROR_UPDATING_NOTE, error);
      alert(APP_STRINGS.ERROR_UPDATING_NOTE);
    }
  };

// handle reply delete click
  const handleReplyDeleteClick = async (replyId: string) => {
    try {
      const userData = userProfile;
      const userId = userData?.sub || '';

      await deleteFieldNote(userId, replyId);

      // Refresh notes to remove deleted reply
      const response = await getFieldNotesByLakeId(lakePulseId!, 1, 100, userId);
      if (Array.isArray(response)) {
        setNotes(response);
        setTotalCount(response.length);
      }
    } catch (error) {
      console.error(APP_STRINGS.ERROR_DELETING_NOTE, error);
      alert(APP_STRINGS.ERROR_DELETING_NOTE);
    }
  };

  // Add useEffect for handling outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const replySection = document.querySelector('.reply-input-section');
      if (replySection && !replySection.contains(event.target as Node)) {
        setReplyingTo(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <><main>
        <div className="field-notes-header">
          <h1>{APP_STRINGS.FIELD_NOTES_PAGE.TITLE}</h1>
        </div>
        <div className="field-notes-container">
          <div className="notes-scroll-area">
            
{loading ? (
  <div>{APP_STRINGS.LOADING}</div>
) : notes.length === 0 ? (
  <div className="no-notes">{APP_STRINGS.NO_FIELD_NOTES_AVAILABLE}</div>
) : (
  paginatedNotes().map((note) => {
    // Define levelInfo and iconColor for each note here
   const levelInfo = getLevelInfo(note.alertLevelId);
    const iconColor = levelInfo?.levelColor || "#ccc";

    return (
      <div key={note.id} className="note-item">
                  <div className="note-header">
                    <span className="note-time">{formatDate(note.createdTime)}</span>

                   {note.userId === userProfile?.sub && !note.isAlert && (
                        <div className="note-actions">
                          {editingNote?.id === note.id ? (
                            <button
                              onClick={handleSaveEdit}
                              className="action-btn save"
                              title="Save note"
                            >
                              <i className="fa-light fa-save"></i>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditClick(note)}
                              className="action-btn edit"
                              title="Edit note"
                            >
                              <i className="fa-light fa-edit"></i>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(note.id.toString())}
                            className="action-btn delete"
                            title="Delete note"
                          >
                            <i className="fa-light fa-trash"></i>
                          </button>
                        </div>
                      )}
                  </div>
                  <div className="note-content">
                    {editingNote?.id === note.id ? (
                      <textarea
                        value={editingNote.note}
                        onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                        className="note-input"
                      />
                    ) : (
                      <>{note.isAlert && (
                <>
                  <i className={"fa-solid fa-triangle-exclamation inline-block" +  ((note.alertLevelId == null && note.alertCategorieId == null) ? " automated-icon" : "")}/>
    <span
      className={
        "inline-block alert-label" +
        ((note.alertLevelId == null && note.alertCategorieId == null) ? " automated-label" : "")
      }
      style={{ background: iconColor }}>
      {levelInfo?.levelLabel}
    </span>
                </>
              )}
              <p className="field-notes-title inline" style={{ margin: 0 }}>
                {note.note}
              </p></>
                    )}
                    
                  </div>
                  <div className="note-like-count">
                  <button 
                      className={`like-button ${likedStatus[note.id] === 1 ? 'liked' : ''}`}
                      onClick={() => toggleLike(note.id.toString())}
                    >
                      {likedStatus[note.id] === 1 ? 
                        <i className="fa-thin fa-heart"></i> : 
                        <i className="fa-thin fa-heart"></i>
                      }
                    </button>
                    <span className="field-notes-like-count">{note.likeCount}</span>
                      <span 
                      className="reply-icon" 
                      onClick={() => handleReplyClick(note.id.toString())}
                    >
                      <i className="fa-thin fa-reply"></i>
                    </span>
                    {notes.filter(reply => reply.fieldNoteId === note.id.toString()).length > 0 && (
                      <span 
                        className="view-replies-link"
                        onClick={() => toggleReplies(note.id.toString())}
                      >
                        -- {APP_STRINGS.VIEW_REPLIES } {notes.filter(reply => reply.fieldNoteId === note.id.toString()).length} {APP_STRINGS.REPLIES}
                      </span>
                    )}
                  
                  </div>

                  {replyingTo === note.id.toString() && (
                    <div className="reply-input-section">
                      <textarea
                        placeholder="Write a reply..."
                        value={replyText[note.id.toString()] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [note.id.toString()]: e.target.value }))}
                        className="reply-input"
                      />
                      <div className="reply-buttons">
                        <button 
                          onClick={() => handleSaveReply(note.id.toString())}
                          className="reply-send-btn"
                        >
                          {APP_STRINGS.REPLY}
                        </button>
                        <button 
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText(prev => ({ ...prev, [note.id.toString()]: '' }));
                          }}
                          className="reply-cancel-btn"
                        >
                          {APP_STRINGS.CANCEL}
                        </button>
                      </div>
                    </div>  
                  )}

                  {/* Show replies for this note */}
                  {showReplies[note.id.toString()] && notes.filter(reply => reply.fieldNoteId === note.id.toString()).length > 0 && (
                    <div className="replies-section">
                      {notes
                        .filter(reply => reply.fieldNoteId === note.id.toString())
                        .map(reply => (
                          <div key={reply.id} className="reply-content">
                            <div className="reply-header">
                              <span className="reply-author">
                                {reply.userId === userProfile?.sub ? 
                                  `${userProfile?.given_name || ''} ${userProfile?.family_name || ''}`.trim() :
                                  reply.userName}
                              </span>
                              <span className="reply-time">{formatDate(reply.createdTime)}</span>
                            </div>
                            <div className="reply-text-actions">
                            {editingReply?.id === reply.id ? (
                              <textarea
                                value={editingReply.note}
                                onChange={(e) => setEditingReply({ ...editingReply, note: e.target.value })}
                                className="reply-input"
                              />
                            ) : (
                              <div className="reply-text">{reply.note}</div>
                            )}
                            <div className="reply-actions">
                                {reply.userId === userProfile?.sub && (
                                  <>
                                    {editingReply?.id === reply.id ? (
                                      <button
                                        onClick={() => handleSaveReplyEdit(reply)}
                                        className="action-btn save"
                                        title="Save reply"
                                      >
                                        <i className="fa-light fa-save"></i>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleReplyEditClick(reply)}
                                        className="action-btn edit"
                                        title="Edit reply"
                                      >
                                        <i className="fa-light fa-edit"></i>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleReplyDeleteClick(reply.id.toString())}
                                      className="action-btn delete"
                                      title="Delete reply"
                                    >
                                      <i className="fa-light fa-trash"></i>
                                    </button>
                                  </>
                                )}
                                </div>
                              </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="note-footer">
                    <span className="field-notes-author">
                      {APP_STRINGS.POSTED_BY} {note.userId === userProfile?.sub ?
                        `${userProfile?.given_name || ''} ${userProfile?.family_name || ''}`.trim() :
                        note.userName
                      }
                    </span>
                  </div>
                </div>
    );
  })
)}


            {notes.length > 0 && (
              <div className="pagination-container">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(notes.length / 10))}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          <div className="add-note-fixed">
            <textarea
              placeholder={APP_STRINGS.FIELD_NOTES_PAGE.PLACEHOLDER.TITLE}
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="note-input" />
            <button onClick={handleSaveNewNote} className="theme-button">
              {APP_STRINGS.POST}
            </button>
          </div>
        </div>

        {deleteConfirmId && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <p>{APP_STRINGS.DELETE_CONFIRM_DIALOG}</p>
              <div className="delete-confirm-actions">
                <button className="confirm-btn" onClick={handleConfirmDelete}>
                  {APP_STRINGS.DELETE_BUTTON}
                </button>
                <button className="cancel-btn" onClick={() => setDeleteConfirmId(null)}>
                  {APP_STRINGS.CANCEL_BUTTON}
                </button>
              </div>
            </div>
          </div>
        )}
      </main></>
  );
};

export default FieldNotesResults; 