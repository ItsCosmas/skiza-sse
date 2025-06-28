import Nav from "components/nav/Nav";
import Table from "components/table/Table";

function Home() {
  return (
    <div className="container mx-auto">
      <Nav />
      <main className="container mx-auto mt-6">
        <div className="divider"></div>
        <Table />
      </main>
    </div>
  );
}

export default Home;
