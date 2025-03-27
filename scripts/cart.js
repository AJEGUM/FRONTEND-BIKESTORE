// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.querySelector('.carrito');
    const cartMenu = document.querySelector('.cart-menu');

    // Mostrar/ocultar el menú del carrito al hacer clic en el icono
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        cartMenu.classList.toggle('active');
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener('click', function(e) {
        if (!cartMenu.contains(e.target) && !cartIcon.contains(e.target)) {
            cartMenu.classList.remove('active');
        }
    });  
});
