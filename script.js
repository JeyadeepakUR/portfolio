// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
    initializeMLPipeline();
    initializeDataFlow();
    initializeMetricsAnimation();
});

// ML Pipeline Interaction
function initializeMLPipeline() {
    const pipelineSteps = document.querySelectorAll('.pipeline-step');
    
    pipelineSteps.forEach(step => {
        step.addEventListener('mouseenter', () => {
            // Add pulse effect to connected arrows
            const arrows = document.querySelectorAll('.pipeline-arrow');
            arrows.forEach(arrow => arrow.style.animation = 'pulse 1s infinite');
            
            // Highlight current step
            step.style.transform = 'scale(1.1)';
            step.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
        });

        step.addEventListener('mouseleave', () => {
            const arrows = document.querySelectorAll('.pipeline-arrow');
            arrows.forEach(arrow => arrow.style.animation = '');
            step.style.transform = '';
            step.style.boxShadow = '';
        });
    });
}

// Data Flow Animation
function initializeDataFlow() {
    const dataNodes = document.querySelectorAll('.data-node');
    let currentNodeIndex = 0;

    // Highlight nodes sequentially
    const highlightNextNode = () => {
        dataNodes.forEach(node => {
            node.style.transform = '';
            node.style.borderColor = '';
        });

        if (currentNodeIndex < dataNodes.length) {
            const currentNode = dataNodes[currentNodeIndex];
            currentNode.style.transform = 'scale(1.1)';
            currentNode.style.borderColor = 'var(--secondary-color)';
            currentNodeIndex = (currentNodeIndex + 1) % dataNodes.length;
        }
    };

    // Start animation when section is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setInterval(highlightNextNode, 2000);
            }
        });
    }, { threshold: 0.5 });

    const dataFlow = document.querySelector('.data-flow-viz');
    if (dataFlow) observer.observe(dataFlow);
}

// Animate metrics when in view
function initializeMetricsAnimation() {
    const metrics = document.querySelectorAll('.metric-value');
    
    metrics.forEach(metric => {
        const targetValue = parseInt(metric.textContent);
        metric.textContent = '0';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateValue(metric, 0, targetValue, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(metric);
    });
}

// Utility function for smooth number animation
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = `${currentValue}%`;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

// Contact Form Handling
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const submitButton = this.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

    // Send form using FormSubmit's AJAX endpoint
    fetch("https://formsubmit.co/ajax/656c87327b2911bb0fcf357c547ee6c1", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Message sent successfully!', 'success');
            this.reset();
        } else {
            throw new Error('Failed to send message');
        }
    })
    .catch(error => {
        showAlert('Failed to send message. Please try again.', 'danger');
        console.error('Error:', error);
    })
    .finally(() => {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    });
});

// Alert function for feedback
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(alertDiv, form);

    // Auto-dismiss alert after 5 seconds
    // setTimeout(() => {
    //     alertDiv.remove();
    // }, 5000);
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
