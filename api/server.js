const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

//CONEXION A LA BASE DE DATOS

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tienda_en_linea'
})

//FUNCION PARA LA CONEXION Y LA RECONEXION
function conectarBD(){
    conexion.connect((error)=>{
        if(error){
            console.log('[db error]', error)
            setTimeout(conectarBD, 200) //200 milisegundos y vuelve a intentar la conexion
        }else{
            console.log("¡CONEXION EXITOSA A LA BASE DE DATOS!")
        }
    })
    //Cuando la conexion ya esta establecida pero se pierde, llama otra vez la funcion para restablecer, pero si se pierde la conexion lanza una excepcion y se detiene la ejecucion
    conexion.on('error', error =>{
        if(error.code == "PROTOCOL_CONNECTION_LOST"){
            conectarBD()
        }
        else{
            throw error
        }
    })
}

conectarBD()

////////////////////// CRUD COMPLETO //////////////////////

//FUNCION GENERICA PARA OBTENER TODOS LOS REGISTROS DE UNA TABLA ESPECIFICA
//select * from clientes;
// ESTA FUNCION OBTIENE TODOS LOS REGISTROS DE LA TABLA 
function obtenerTodos(tabla){
    return new Promise((resolve, reject)=>{
        //query es la consulta
        conexion.query(`SELECT * FROM ${tabla}`, (error, resultados) =>{
            if(error) reject(error)
                else resolve(resultados)
        })
    });
}

//ESTA FUNCION REGISTRA UN OBJETO POR ID EN LA TABLA
function obtenerUno(tabla, id){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla} WHERE id = ?`,[id], (error, resultado)=>{
            if(error) reject(error)
                else resolve(resultado)
        })
    })
}


//ESTA FUNCION INSERTA DATOS EN UNA TABLA ESPECIFICA (1)
function crear(tabla, data){
    //PROMESA (Promise)
    return new Promise((resolve, reject)=>{
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, resultado)=>{ //(1)
            if(error) reject(error)
                else{
            //SI ES EXITOSO DEVUELVE EL OBJETO Y ID GENERADO Y RESUELVE LA PROMESA
            Object.assign(data,{id: resultado.insertId})
                    resolve(data)
            }
        })
    })
}

//ESTA FUNCION SIRVE PARA ACTUALIZAR UN REGISTRO EN UNA TABLA POR SU ID
function actualizar (tabla,id,data){
    return new Promise((resolve, reject)=>{
        conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [data, id], (error, resultado)=>{
            if(error) reject(error)
                else resolve(resultado)
        }) //(1)
    })
}

//ESTA FUNCION ELIMINA UN REGISTRO DE LA TABLA POR SU ID
function eliminar(tabla,id){
    return new Promise((resolve, reject)=>{
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, [id], (error, resultado)=>{
            if(error) reject(error)
                else resolve(resultado)
        }) //(1)
    })
}

// LAS RUTAS EN EXPRESS DEFINEN COMO EL SERVIDOR WEB RESPONDE A LAS SOLICITUDES HTTP EN DIFERENTES URL.
// EN ESTE CASO SE DEFINIO UN CRUD GENERICO EN DONDE SE UTILIZARAN RUTAS DINAMICAS BASADAS EN LA TABLA QUE EL USUARIO ESPECIFIQUE


//RUTA DE INICIO
app.get(`/`,(req, res)=>{
    res.send(`Ruta INICIO`);
})

//CUANDO UN USUARIO ACCEDE A HTTP://LOCALHOST:3000/, "EL SERVIDOR RESPONDE CON EL MENSAJE `Ruta INICIO`"
//ESTA RUTA DEVUELVE TODOS LOS REGISTROS A TRAVEZ DE ESTA CONSULTA
app.get(`/api/:tabla`, async(req, res)=>{
    try{
        const resultados = await obtenerTodos(req.params.tabla);
        res.send(resultados);
    }catch(error){
        res.status(500).send(error);
    }
});

//ESTA RUTA ME DEVUELVE UN REGISTRO POR SU ID
app.get(`/api/:tabla/:id`, async (req, res)=>{
    try{
        const resultado = await obtenerUno(req.params.tabla, req.params.id);
        res.send(resultado);
    }catch(error){
        res.status(500).send(error);
    }
});

//FUNCION SINCRONA, HACE UN PROCESO DE OPERACIONES, MIENTRAS SE PREPARAN ESTAS OPERACIONES QUEDAN ESPERANDO EN 
//"AWAIT" QUE ES EL ESPERAR, CUANDO ESTAN LISTAS, SE OBTIENE LOS DATOS
//ESTA RUTA CREA UN REGISTRO EN LA TABLA
app.post(`/api/:tabla`, async(req, res)=>{
    try{
        const resultado = await crear(req.params.tabla, req.body);
        res.send(resultado);
    }catch(error){
        res.status(500).send(error);
    }
});

//EDITAR UN REGISTRO POR SU ID
app.put(`/api/:tabla/:id`, async(req, res)=>{
    try{
        const resultado = await actualizar(req.params.tabla,req.params.id, req.body);
        res.send(resultado);
    }catch(error){
        res.status(500).send(error);
    }
});

//ELIMINAR UN REGISTRO POR SU ID
app.delete(`/api/:tabla/:id`, async(req, res)=>{
    try{
        const resultado = await eliminar(req.params.tabla, req.params.id);
        res.send(resultado);
    }catch(error){
        res.status(500).send(error);
    }
});


//SE HA REALIZADO O NO LA CONEXION EN EL PUERTO CONFIGURADO (3000)
const puerto = process.env.PUERT || 3000;
app.listen(puerto,()=>{
    console.log("SERVIDOR CORRIENDO EN EL PUERTO: ", puerto);
});