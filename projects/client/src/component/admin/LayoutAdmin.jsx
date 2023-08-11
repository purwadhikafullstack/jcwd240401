import { Children } from "react";
import Footer from "../Footer";

export default function LayoutAdmin(props) {
  return (
    <div className=" grid grid-rows-7 min-h-screen">
      <div className=" row-span-2 col-span-1 min-h-screen">navbar</div>
      <div className=" row-span-2 col-span-2 flex justify-center w-full min-h-screen">
        {props.children}
      </div>
      <div className=" row-span-1 col-span-3">
        <Footer />
      </div>
    </div>
  );
}
