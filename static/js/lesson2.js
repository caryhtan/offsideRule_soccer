const attacker = document.getElementById('draggableAttacker');
const offsideStatus = document.getElementById('offsideStatus');
const fieldContainer = document.querySelector('.field-container');
let isDragging = false;
let startX;
let startLeftPercent;

function updateOffsideStatus() {
    const attackerLeft = parseFloat(attacker.style.left || '25');
    const attackerRight = attackerLeft + 15; // 15% width
    
    const isOffside = attackerRight >= 45;
    
    offsideStatus.textContent = isOffside ? 'Offside' : 'Onside';
    offsideStatus.style.backgroundColor = isOffside ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
}

attacker.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startLeftPercent = parseFloat(attacker.style.left || '25');
    attacker.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const fieldRect = fieldContainer.getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaPercent = (deltaX / fieldRect.width) * 100;
    const newLeftPercent = Math.max(0, Math.min(85, startLeftPercent + deltaPercent));
    
    attacker.style.left = `${newLeftPercent}%`;
    updateOffsideStatus();
    e.preventDefault();
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    attacker.style.transition = 'left 0.1s ease-out';
    updateOffsideStatus();
});

attacker.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startLeftPercent = parseFloat(attacker.style.left || '25');
    attacker.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const fieldRect = fieldContainer.getBoundingClientRect();
    const deltaX = e.touches[0].clientX - startX;
    const deltaPercent = (deltaX / fieldRect.width) * 100;
    const newLeftPercent = Math.max(0, Math.min(85, startLeftPercent + deltaPercent));
    
    attacker.style.left = `${newLeftPercent}%`;
    updateOffsideStatus();
    e.preventDefault();
});

document.addEventListener('touchend', () => {
    isDragging = false;
    attacker.style.transition = 'left 0.1s ease-out';
    updateOffsideStatus();
});

updateOffsideStatus();