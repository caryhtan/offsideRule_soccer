document.addEventListener('DOMContentLoaded', function() {
    const quizForm = document.getElementById('quizForm');
    const answerOptions = document.querySelectorAll('input[name="answer"]');
    const answerError = document.getElementById('answerError');
    
    if (quizForm) {
        quizForm.addEventListener('submit', function(event) {
            let isChecked = false;
            answerOptions.forEach(option => {
                if (option.checked) isChecked = true;
            });
            
            if (!isChecked) {
                event.preventDefault();
                answerError.style.display = 'block';
                answerOptions.forEach(option => {
                    option.classList.add('is-invalid');
                });
            }
        });
        
        // Remove error when an option is selected
        answerOptions.forEach(option => {
            option.addEventListener('change', function() {
                answerError.style.display = 'none';
                answerOptions.forEach(opt => {
                    opt.classList.remove('is-invalid');
                });
            });
        });
    }
});