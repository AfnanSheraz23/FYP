import React, { useState } from "react"

const interestsList = [
  "Technology",
  "Science",
  "Art",
  "Travel",
  "Music",
  "Sports",
  "Education",
  "Health",
]

const SelectInterests = () => {
  const [selectedInterests, setSelectedInterests] = useState([])

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl w-full border border-gray-300 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold mb-6">Select Your Interests</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {interestsList.map((interest) => (
            <div
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`p-4 border rounded cursor-pointer transition text-center 
                ${
                  selectedInterests.includes(interest)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {interest}
            </div>
          ))}
        </div>

        <a
          href="home.html"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
        >
          Next
        </a>
      </div>
    </div>
  )
}

export default SelectInterests
