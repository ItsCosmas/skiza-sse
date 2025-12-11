import Nav from "components/nav/Nav";
import Table from "components/table/Table";

function Home() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const postbackUrl = `${backendUrl}/api/postbacks`;

  return (
    <div className="container mx-auto">
      <Nav />
      <main className="container mx-auto mt-6">
        <span className="flex justify-center mt-2">Send postbacks to {postbackUrl}</span>
        <div className="divider"></div>
        <Table />
      </main>
    </div>
  );
}

export default Home;
