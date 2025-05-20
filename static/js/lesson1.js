
const attacker = document.getElementById('draggableAttacker');
const offsideStatus = document.getElementById('offsideStatus');
const passLine = document.getElementById('passLine');
const otherAttacker = document.querySelector('.attacker:nth-child(5)');
const fieldContainer = document.querySelector('.field-container');
let isDragging = false;
let startX;
let startLeftPercent;

function getAttackerRightPosition(attackerLeft) {
    const attackerWidthPercent = (attacker.offsetWidth / fieldContainer.offsetWidth) * 100;
    return attackerLeft + attackerWidthPercent;
}

function updatePassingLine() {
    const attackerRect = attacker.getBoundingClientRect();
    const otherAttackerRect = otherAttacker.getBoundingClientRect();
    const fieldRect = fieldContainer.getBoundingClientRect();

    const x1 = (attackerRect.left + attackerRect.width/2 - fieldRect.left) / fieldRect.width * 100;
    const y1 = (attackerRect.top + attackerRect.height/2 - fieldRect.top) / fieldRect.height * 100;
    const x2 = (otherAttackerRect.left + otherAttackerRect.width/2 - fieldRect.left) / fieldRect.width * 100;
    const y2 = (otherAttackerRect.top + otherAttackerRect.height/2 - fieldRect.top) / fieldRect.height * 100;

    passLine.setAttribute('x1', `${x1}%`);
    passLine.setAttribute('y1', `${y1}%`);
    passLine.setAttribute('x2', `${x2}%`);
    passLine.setAttribute('y2', `${y2}%`);
}

function updateOffsideStatus() {
    const attackerLeft = parseFloat(attacker.style.left || '62.5');
    const attackerRight = getAttackerRightPosition(attackerLeft);
    const offsideLinePosition = 76.9; 
    
    const isOffside = attackerRight > offsideLinePosition;
    
    offsideStatus.textContent = isOffside ? 'Offside' : 'Onside';
    offsideStatus.style.backgroundColor = isOffside ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
    
    if (isOffside) {
        attacker.style.animation = 'pulse 1s infinite';
    } else {
        attacker.style.animation = 'none';
    }
}

attacker.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startLeftPercent = parseFloat(attacker.style.left || '62.5');
    attacker.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const fieldRect = fieldContainer.getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaPercent = (deltaX / fieldRect.width) * 100;
    const newLeftPercent = Math.max(0, Math.min(92, startLeftPercent + deltaPercent));
    
    attacker.style.left = `${newLeftPercent}%`;
    updateOffsideStatus();
    updatePassingLine();
    e.preventDefault();
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    attacker.style.transition = 'left 0.1s ease-out';
    updateOffsideStatus();
    updatePassingLine();
});

attacker.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startLeftPercent = parseFloat(attacker.style.left || '62.5');
    attacker.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const fieldRect = fieldContainer.getBoundingClientRect();
    const deltaX = e.touches[0].clientX - startX;
    const deltaPercent = (deltaX / fieldRect.width) * 100;
    const newLeftPercent = Math.max(0, Math.min(92, startLeftPercent + deltaPercent));
    
    attacker.style.left = `${newLeftPercent}%`;
    updateOffsideStatus();
    updatePassingLine();
    e.preventDefault();
});

document.addEventListener('touchend', () => {
    isDragging = false;
    attacker.style.transition = 'left 0.1s ease-out';
    updateOffsideStatus();
    updatePassingLine();
});

window.addEventListener('resize', () => {
    updatePassingLine();
    updateOffsideStatus();
});

updateOffsideStatus();
updatePassingLine();
