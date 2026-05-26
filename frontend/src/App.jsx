import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Records from "./pages/Records";
import { DataProvider } from "./context/DataContext";

function App() {
  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </Layout>
    </DataProvider>
  );
}

export default App;
