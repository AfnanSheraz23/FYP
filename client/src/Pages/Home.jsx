import FieldSelection from "../main-components/FieldSelection"
import QuestionModal from "../main-components/QuestionModal"
import QuestionList from "../main-components/QuestionList"

const Home = () => {
  return (
    <>
      <div className="px-5 sm:px-0">
        <QuestionModal />

        {/* <!-- dropdown menu for field selection  --> */}
        {/* <FieldSelection /> */}

        <h2 className="my-5 fs-600 font-bold">Questions For You</h2>
      </div>
      {/* <Question /> */}
      <QuestionList />
    </>
  )
}

export default Home
