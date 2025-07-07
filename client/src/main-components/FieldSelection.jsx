const FieldSelection = () => {
  return (
    <>
      <label htmlFor="field-select">Choose a field: </label>
      <select
        name="field-select"
        id="field-select"
        className="p-2 text-base border border-gray-300 rounded-md w-48 bg-gray-100 outline-none"
      >
        <option value="technology">Technology</option>
        <option value="science">Science</option>
        <option value="business">Business</option>
        <option value="health">Health</option>
        <option value="education">Education</option>
      </select>
    </>
  )
}

export default FieldSelection
