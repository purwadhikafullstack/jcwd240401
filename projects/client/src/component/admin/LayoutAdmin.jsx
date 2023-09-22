import Footer from "../Footer";
import Sidebar from "../Sidebar";

export default function LayoutAdmin(props) {
  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen w-full">
        <div className="shadow-md grid h-screen fixed left-0 z-40">
          <Sidebar />
        </div>
        <div className="min-h-screen flex flex-col gap-2 w-full lg:ml-64">
          <div className="flex-grow flex justify-center">{props.children}</div>
        </div>
      </div>
      <div className="z-50 sticky bottom-0">
        <Footer />
      </div>
    </div>
  );
}
