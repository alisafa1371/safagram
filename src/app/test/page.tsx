async function Test() {
  const result = await fetch("http://localhost:3000/api/test");
  console.log(await result.json());
  return <div>TestPage</div>;
}

export default Test;
