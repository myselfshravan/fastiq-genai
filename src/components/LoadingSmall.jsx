/* eslint-disable no-unused-vars */
import "../App.css";

function LoadingSmall() {
  return (
    <div className="flex justify-center items-center bg-white w-full flex-col">
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="text-gray-700 ml-2">Generating Response...</p>
    </div>
  );
}

export default LoadingSmall;
