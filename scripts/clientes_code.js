//DEFINICION DE VARIABLES
const url = 'http://localhost:3000/api/clientes/';
const contenedor = document.querySelector('tbody');
const modal = document.getElementById('modalCliente');
const formCliente = document.querySelector('form');
const nombre = document.getElementById('nombre');
const cedula = document.getElementById('cedula');
const tefelono = document.getElementById('telefono');
const correo = document.getElementById('correo');
const estatura = document.getElementById('estatura');
const edad = document.getElementById('edad');
const btnCrear = document.getElementById('btnCrear');
const closeBtn = document.querySelector('.close');
const closeBtnsSecondary = document.querySelector('.close-btn');
let opcion = '';
let idForm = 0;

//FUNCIONES DEL MODAL
btnCrear.onclick = function(){
    modal.style.display = "block";
    opcion = 'crear';
    nombre.value = '';
    cedula.value = '';
    tefelono.value = '';
    correo.value = '';
    estatura.value = '';
    edad.value = '';
};

closeBtn.onclick = function(){
    modal.style.display = "none";
};

closeBtnsSecondary.onclick = function(){
    modal.style.display = "none";
}

window.onclick = function(event){
    if(event.target==modal){
        modal.style.display = "none";
    }
};

document.getElementById('btnRegresar').addEventListener('click', function(){
    window.location.href = '/interfaz.html';
});

//FUNCION PARA MOSTRAR O LISTAR LOS RESULTADOS OBTENIDOS DE LA BASE DE DATOS
const mostrar = (clientes)=>{
    contenedor.innerHTML = '';
    clientes.forEach(cliente =>{ //
        contenedor.innerHTML += `
            <tr>
                <td class="visually-hidden">${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.cedula}</td> 
                <td>${cliente.tefelono}</td>
                <td>${cliente.correo}</td>
                <td>${cliente.estatura}</td>
                <td>${cliente.edad}</td>
                <td>
                    <button class="btn btn-primary btnEditar">Editar</button>
                    <button class="btn btn-danger btnBorrar">Borrar</button>
                </td>
            </tr>
        `;
    })
}

//CARGAR DATOS
fetch(url)
    .then(response => response.json())
    .then(data => mostrar(data))
    .catch(error => console.log(error));

//FUNCION PARA MANEJAR EVENTOS DELEGADOS
const on = (element,event, selector, handler)=>{
    element.addEventListener(event, e => {
        if(e.target.closest(selector)){
            handler(e);
        }
    });
};

//PROCEDIMIENTO PARA BORRAR 
on (document, 'click', '.btnBorrar', e =>{
    const fila = e.target.closest('tr');
    const id = fila.cells[0].textContent;
    
    if(confirm('¿Estas seguro de eliminar este registro?')){

        fetch(url + id,{
            method: 'DELETE',
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response=>{
            if(!response.ok){   
                throw new Error('ERROR EN LA RESPUESTA DEL SERVIDOR')
            }
            return response.json();
        })
        .then(()=>{
            fila.remove();
        })
        .catch(error=>{
            console.error('Error:', error);
            alert('Hubo un error al tratar de eliminar el registro  ');
        });
    }
});

//PROCEDIMIENTO PARA ACTUALZIAR REGISTRO
on (document, 'click', '.btnEditar', e =>{
    const fila = e.target.closest('tr');
    idForm = fila.cells[0].textContent;
    nombre.value = fila.cells[1].textContent;
    cedula.value = fila.cells[2].textContent;
    tefelono.value = fila.cells[3].textContent;
    correo.value = fila.cells[4].textContent;
    estatura.value = fila.cells[5].textContent;
    edad.value = fila.cells[6].textContent;
    opcion = 'editar';
    modal.style.display = "block";
})

//PROCEDIMIENTO PARA CREAR Y EDITAR
formCliente.addEventListener('submit', (e)=>{
    e.preventDefault();

    const data = {
        nombre: nombre.value,
        cedula: cedula.value,
        tefelono: tefelono.value,
        correo: correo.value,
        estatura: estatura.value,
        edad: edad.value,
    };
    const method = opcion === 'crear' ? 'POST' : 'PUT';
    const endPoint = opcion === 'crear' ? url : url + idForm;

    fetch(endPoint,{ 
        method: method,
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json()) //
    .then(data =>{
        if(opcion === 'crear'){
            const nuevoCLiente = [data];
            mostrar(nuevoCLiente); //
        } else{
            fetch(url)
            .then(response => response.json())
            .then(data => mostrar(data));
        }
        modal.style.display="none";
    })
    .catch(error => {
        console.error('ERROR', error); //
        alert('Hubo un error al procesar la solicitud')
    });
});