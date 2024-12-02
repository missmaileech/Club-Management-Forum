function openGoogleLogin() {
  const width = 500;
  const height = 600;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  const popup = window.open(
    "/auth/google",
    "Google Login",
    `width=${width},height=${height},top=${top},left=${left}`
  );

  const interval = setInterval(() => {
    if (popup.closed) {
      clearInterval(interval);
      window.location.reload();
    }
  }, 1000);
}
