/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { MdOutlinePushPin } from "react-icons/md";
import { MdCreate, MdDelete } from "react-icons/md";
// import PropTypes from "prop-types";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div
      className="border rounded
    p-4 bg-white hover: shadow-xl transition-all ease-in-out">
      <div className="flex justify-between items-center">
        <div>
          <h6 className="text-sm font-medium">{title} </h6>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
        <MdOutlinePushPin
          className={`icon-btn ${isPinned ? "text-primary" : "text-slate-300"}`}
          onClick={onPinNote}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">{content?.slice(0, 60)}</p>

      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-500">{tags}</div>
        <div className="flex itemas-center gap-2">
          <MdCreate
            className="icon-btn hover: text-green-500"
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn hover: text-red-500"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

// NoteCard.propTypes = {
//   title: PropTypes.string.isRequired,
//   date: PropTypes.string.isRequired,
//   content: PropTypes.string.isRequired,
//   tags: PropTypes.string.isRequired,
//   isPinned: PropTypes.bool.isRequired,
//   onEdit: PropTypes.func.isRequired,
//   onDelete: PropTypes.func.isRequired,
//   onPinNote: PropTypes.func.isRequired,
// };

export default NoteCard;
