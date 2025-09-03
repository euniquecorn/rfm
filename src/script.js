document.addEventListener('DOMContentLoaded', () => {
    // Handle 'Add to Cart' buttons on the Apparel page
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                alert(`Item "${itemId}" added to cart! (Simulated)`);
                // In a real application, you would update a cart state here,
                // potentially using localStorage or making an API call.
                // For now, we just show an alert.
            });
        });
    }

    // Navigation highlighting logic (optional, but good for user feedback)
    // This would typically be handled by server-side rendering or a framework,
    // but for a static site, we can add basic logic if needed.
    // For now, explicitly setting active classes in HTML is sufficient.

    // Example: If you wanted to dynamically set active class based on URL
    /*
    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentPath.includes(linkPath)) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
    */
});