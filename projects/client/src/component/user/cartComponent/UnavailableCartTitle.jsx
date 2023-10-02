import { CgUnavailable } from "react-icons/cg";

export default function UnavailableCartTitle({ unavailableCart }) {
  if (unavailableCart) {
    return (
      <>
        <div className="flex mx-2 py-2 content-center gap-4 border-b mb-4 sm:mx-4 lg:mx-8 xl:mx-16">
          <div className="grid">
            <CgUnavailable size={25} />
          </div>
          <div className="font-medium">
            {" "}
            Invalid Items{" "}
            <span className="text-maindarkgreen font-medium">
              ({unavailableCart.length})
            </span>
          </div>
        </div>
      </>
    );
  }
}
