
import Popover from "../../../components/UI/custom/Popover";
import ThemeModeSwitch from "../../../components/UI/custom/ThemeModeSwitch";

const LandingPage = () => {



  return (
    <div>
      <div>
      </div>
      <Popover buttonLabel="Click me">
        <p>This is the content inside the popover.</p>
      </Popover>
      <ThemeModeSwitch />
    </div>
  )
}

export default LandingPage
