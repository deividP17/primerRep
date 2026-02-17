const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const startDate = new Date(bookingForm.fechaInicio.value);
  const endDate = new Date(bookingForm.fechaFin.value);

  if (endDate < startDate) {
    formMessage.textContent = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    formMessage.style.color = "#d92d20";
    return;
  }

  formMessage.textContent =
    "¡Gracias por tu consulta! En breve el equipo de GNM Tour se contactará con vos.";
  formMessage.style.color = "#12b76a";
  bookingForm.reset();
});
