import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./routes/Home.jsx";
import ClientHome from "./routes/ClientHome.jsx";
import FreelancerHome from "./routes/FreelancerHome.jsx";
import CreateJob from "./routes/CreateJob";
import ClientProfile from "./routes/ClientProfile";
// import FreelancerProfile from "./routes/FreelancerProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/client" element={<ClientHome />}></Route>
        <Route path="/freelancer" element={<FreelancerHome />}></Route>
        <Route path="/createJob" element={<CreateJob />}></Route>
        <Route path="/clientProfile" element={<ClientProfile />}></Route>
        {/* <Route
          path="/freelancerProfile"
          element={<FreelancerProfile />}
        ></Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
