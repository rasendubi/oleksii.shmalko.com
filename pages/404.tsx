export default function Page404() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ marginBottom: 16 }}>{'404'}</h1>
      <p>{'This page is private or does not exist.'}</p>
    </div>
  );
}
