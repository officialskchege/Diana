export function wireDianaPointerFollow(root) {
  const scene = root.querySelector(".dianaScene");
  if (!scene) return () => {};

  const avatar = root.querySelector(".avatar");
  const eyes = root.querySelector(".eyes");
  if (!avatar || !eyes) return () => {};

  const eyeEls = Array.from(root.querySelectorAll(".eye"));

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function onMove(e) {
    const rect = scene.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1

    // head follow (subtle)
    const tx = (x - 0.5) * 10;
    const ty = (y - 0.5) * 6;
    avatar.style.transform = `translate(${tx}px, ${ty}px) scale(1.01)`;

    // eye movement (translate each eye)
    const dx = clamp((x - 0.5) * 10, -6, 6);
    const dy = clamp((y - 0.5) * 6, -4, 4);

    eyeEls.forEach((eye, idx) => {
      const dir = idx === 0 ? -1 : 1;
      // give slight mirror effect
      eye.style.transform = `translate(${dx}px, ${dy}px) rotate(${dir * dx * 0.2}deg)`;
    });
  }

  function onLeave() {
    avatar.style.transform = "";
    eyeEls.forEach((eye) => (eye.style.transform = ""));
  }

  scene.addEventListener("pointermove", onMove);
  scene.addEventListener("pointerleave", onLeave);

  return () => {
    scene.removeEventListener("pointermove", onMove);
    scene.removeEventListener("pointerleave", onLeave);
  };
}
