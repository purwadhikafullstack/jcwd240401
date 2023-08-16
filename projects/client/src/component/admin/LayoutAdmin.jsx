import Footer from "../Footer";
import Sidebar from "../Sidebar";

export default function LayoutAdmin(props) {
  return (
    <div className="grid min-h-screen w-full">
      <div className="min-h-screen flex gap-2">
        <div className="lg:basis-1/6 shadow-md grid">
          <Sidebar />
        </div>
        <div className="flex-grow flex justify-center">
          {props.children}
        </div>
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
