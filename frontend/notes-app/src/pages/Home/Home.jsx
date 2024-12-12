/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Navbar, NoteCard, Toast } from "../../components";
import { MdAdd } from "react-icons/md";
import { AddEditNotes } from "../index.js";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  // Close toast message
  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  // Get user info
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await axiosInstance.get("/get-user");
        if (response.data && response.data.user) {
          setUserInfo(response.data.user);
        }
      } catch (error) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };
    getUserInfo();
    return () => {};
  }, [setUserInfo, navigate]);

  // Get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/all-notes");
      console.log("API Response:", response.data);

      // Correctly setting the notes
      if (response.data && response.data.data) {
        setAllNotes(response.data.data);
      } else {
        console.log("No notes received from API.");
      }
    } catch (error) {
      console.error("Unexpected error in getAllNotes: ", error);
    }
  };

  // Delete note
  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("Unexpected error in getAllNotes: ", error);
      }
    }
  };

  // Search Notes
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });
      if (response.data && response.data.data) {
        setIsSearch(true);
        setAllNotes(response.data.data);
      }
    } catch (error) {
      console.log("Unexpected error in getAllNotes: ", error);
    }
  };

  // Update the note's isPinned property
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/update-pin-note/" + noteId, {
        isPinned: !noteId.isPinned,
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes();
      }
    } catch (error) {
      console.log("Unexpected error in updateIsPinned: ", error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    setAllNotes(null);
  };
  // Use getAllNotes in useEffect
  useEffect(() => {
    getAllNotes();
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-8">
          {allNotes?.map((item, index) => (
            <NoteCard
              key={item._id}
              title={item.title}
              date={item.createdOn}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteNote(item)}
              onPinNote={() => updateIsPinned(item)}
            />
          ))}
        </div>
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          });
        }}>
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll">
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({
              isShown: false,
              type: "add",
              data: null,
            });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
