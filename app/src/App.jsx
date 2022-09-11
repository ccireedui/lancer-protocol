import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from './routes/Home.jsx';
import ClientHome from './routes/ClientHome.jsx';
import FreelancerHome from './routes/FreelancerHome.jsx';
import CreateJob from './routes/CreateJob';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Home/>  }></Route>
        <Route path="/client" element={ <ClientHome />  }></Route>
        <Route path="/freelancer" element={ <FreelancerHome />  }></Route>
        <Route path="/createJob" element={ <CreateJob />  }></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
