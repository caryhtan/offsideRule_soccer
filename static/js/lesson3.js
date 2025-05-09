const attacker = document.getElementById('draggableAttacker');
const offsideStatus = document.getElementById('offsideStatus');
const passLine = document.getElementById('passLine');
const otherAttacker = document.getElementById('staticAttacker');
const fieldContainer = document.querySelector('.field-container');
const resetBtn = document.getElementById('resetBtn');
const offsideLine = document.querySelector('.offside-line');
let isDragging = false;
let startX;
let startLeftPercent;

// Initialize positions
const initialPositions = {
    draggableAttacker: { left: 5, top: 8 },
    staticAttacker: { left: 0, top: 62.5 }
};

// Movement constraints
const movementConstraints = {
    minLeft: initialPositions.draggableAttacker.left, // Can't move left of initial position (5%)
    maxLeft: 60 // New maximum left position (60%)
};

function resetPositions() {
    attacker.style.left = `${initialPositions.draggableAttacker.left}%`;
    attacker.style.top = `${initialPositions.draggableAttacker.top}%`;
    attacker.style.transition = 'left 0.3s ease-out';
    updateOffsideStatus();
    updatePassingLine();
    // Remove transition after animation completes
    setTimeout(() => {
        attacker.style.transition = 'none';
    }, 300);
}

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
    const attackerLeft = parseFloat(attacker.style.left || initialPositions.draggableAttacker.left);
    const attackerRight = getAttackerRightPosition(attackerLeft);
    const offsideLinePosition = 32; 
    
    const isOffside = attackerRight > offsideLinePosition;
    
    offsideStatus.textContent = isOffside ? 'Offside' : 'Onside';
    offsideStatus.style.backgroundColor = isOffside ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
    offsideLine.style.display = isOffside ? 'block' : 'none';
    
    if (isOffside) {
        attacker.style.animation = 'pulse 1s infinite';
    } else {
        attacker.style.animation = 'none';
    }
}

// Event Listeners
attacker.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startLeftPercent = parseFloat(attacker.style.left || initialPositions.draggableAttacker.left);
    attacker.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const fieldRect = fieldContainer.getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaPercent = (deltaX / fieldRect.width) * 100;
    
    // Calculate new position within constraints
    const newLeftPercent = Math.min(
        movementConstraints.maxLeft, // Maximum left position (60%)
        Math.max(
            movementConstraints.minLeft, // Minimum left position (5%)
            startLeftPercent + deltaPercent
        )
    );
    
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

// Touch events
attacker.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startLeftPercent = parseFloat(attacker.style.left || initialPositions.draggableAttacker.left);
    attacker.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const fieldRect = fieldContainer.getBoundingClientRect();
    const deltaX = e.touches[0].clientX - startX;
    const deltaPercent = (deltaX / fieldRect.width) * 100;
    
    // Calculate new position within constraints
    const newLeftPercent = Math.min(
        movementConstraints.maxLeft, // Maximum left position (60%)
        Math.max(
            movementConstraints.minLeft, // Minimum left position (5%)
            startLeftPercent + deltaPercent
        )
    );
    
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

// Reset button
resetBtn.addEventListener('click', resetPositions);

// Window resize
window.addEventListener('resize', () => {
    updatePassingLine();
    updateOffsideStatus();
});

// Initialize
resetPositions();