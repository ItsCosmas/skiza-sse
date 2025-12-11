import Nav from "components/nav/Nav";
import Table from "components/table/Table";

function Home() {
  return (
    <div className="container mx-auto">
      <Nav />
      <main className="container mx-auto mt-6">
        <span className="flex justify-center mt-2">Send postbacks to {import.meta.env.VITE_BACKEND_URL+'/api/postbacks' || "http://localhost:8080/api/postbacks"}</span>
        <div className="divider"></div>
        <Table />
      </main>
    </div>
  );
}

export default Home;
