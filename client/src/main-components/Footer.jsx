const Footer = () => {
  return (
    <div className="bg-[#003262] text-white text-center p-2 mt-5">
      <ul className="md:hidden list-none text-xs mb-5">
        <li>
          <a
            href="#"
            className="block text-white py-2 hover:bg-gray-100 rounded"
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#"
            className="block text-white py-2 hover:bg-gray-100 rounded"
          >
            Contact Us
          </a>
        </li>
      </ul>
      <p>&copy; 2025 Peer Help - All rights reserved</p>
    </div>
  )
}

export default Footer
