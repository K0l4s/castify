
import Popover from "../../../components/UI/custom/Popover";
import { useToast } from "../../../context/ToastProvider";

const LandingPage = () => {

  const toast = useToast();

  return (
    <div>
      <div>
      </div>
      <Popover buttonLabel="Click me">
        <p>This is the content inside the popover.</p>
      </Popover>
      <button onClick={() => toast.success("Hello")}>Click me</button>
    </div>
  )
}

export default LandingPage
