import { Outlet } from "react-router-dom"
import Header from "./main-components/Header"
import Sidebar from "./main-components/Sidebar"
import MessageWidget from "./main-components/MessageWidget"

function Layout() {
  return (
    <div className=" bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <MessageWidget />
      {/* <Temp /> */}
      <Header />
      <div className="container">
        <Sidebar />
        <main className="CONTENT m-0 px-0 sm:w-11/12 sm:pr-0 sm:pl-5 md:w-8/12 lg:w-3/5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
