function Toast({ message, type, onClose, onConfirm, onCancel }) {
  return (
    <div
      style={{
        backgroundColor:
          type === "success"
            ? "#4BB543"
            : type === "error"
            ? "#FF3333"
            : "#333333",
      }}
      className={`fixed bottom-[20px] left-[20px] text-white py-[10px] px-[20px] rounded-[5px] shadow-[0px_0px_10px_rgba(0,0,0,0.2)] flex items-center gap-4 dark:shadow-[0px_0px_10px_rgba(255,255,255,0.1)]`}
    >
      <span>{message}</span>
      {type === "confirmation" ? (
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="bg-white dark:bg-gray-800 text-black dark:text-gray-100 px-2 py-1 rounded text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 dark:bg-gray-600 text-white dark:text-gray-100 px-2 py-1 rounded text-sm font-semibold hover:bg-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={onClose}
          className="ml-[10px] bg-none border-none text-white dark:text-gray-100 font-bold cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default Toast
