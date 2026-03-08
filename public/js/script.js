// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

//script for the review range output

const rangeInput = document.getElementById('rating');
const rangeOutput = document.getElementById('rangeValue');

if (rangeInput && rangeOutput) {
  rangeOutput.textContent = rangeInput.value;
  rangeInput.addEventListener('input', function() {
    rangeOutput.textContent = this.value;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const loaderOverlay = document.getElementById('loaderOverlay');
  
  if (form && loaderOverlay) {    
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }
      loaderOverlay.classList.add('active');  // ← shows your overlay
    });
  } else {
    console.error('Form or loader overlay not found!');
  }
});
