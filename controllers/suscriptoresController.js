import Suscriptor from "../models/Suscriptor.js";
import { generarId } from "../helpers/funciones.js";

import Pagos from "../models/Pagos.js";
import {
  generarNumeroSocio,
  verificarEstadoDeDeuda,
  hoyFormateado,
  hoy,
} from "../helpers/funciones.js";
import Ejercicio from "../models/Ejercicio.js";

const obtenerSuscriptores = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const suscriptores = await Suscriptor.find()
    .populate("tipoSuscripcion")
    .select(
      `nombre estado fechas.fechaVencimientoSuscripcion socio tipoSuscripcion `
    )
    .where("creador")
    .equals(req.usuario)
    .sort({ nombre: "ascending" });

  // console.log(suscriptores);

  if (!suscriptores) {
    const error = new Error("Suscriptor No Encontrado");
    console.log(error);
    return res.status(404).json({ msg: error.message });
  }

  if (!suscriptores) {
    const error = new Error("Ningun Suscriptor se ha encontrado");
    console.log(error);
    return res.status(404).json({ msg: error.message });
  }

  // if (suscriptores.creador.toString() !== req.usuario._id.toString()) {
  //   const error = new Error("No eres el creador de este Suscriptor");
  //   console.log(error);
  //   return res.status(401).json({ msg: error.message });
  // }

  res.json({
    suscriptores,
  });
};

const obtenerSuscriptorId = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { usuario } = req;
  const { id } = req.params;
  const suscriptor = await Suscriptor.findById(id).populate([
    {
      path: "pagos._id",
      model: "Pagos",
    },
    "tipoSuscripcion",
  ]);

  const { pagos: array } = suscriptor;

  let arrayPagosSuscriptor = [];
  for (let i = 0; i < array.length; i++) {
    let result = array[i]._id;
    arrayPagosSuscriptor.push(result);
    console.log(result);
  }
  if (!suscriptor) {
    const error = new Error("Suscriptor No Encontrado");
    console.log(error);
    return res.status(404).json({ msg: error.message });
  }

  if (!suscriptor) {
    const error = new Error("Ningun Suscriptor se ha encontrado");
    console.log(error);
    return res.status(404).json({ msg: error.message });
  }

  if (suscriptor.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No eres el creador de este Suscriptor");
    console.log(error);
    return res.status(401).json({ msg: error.message });
  }

  try {
    res.send({
      suscriptor,
      arrayPagosSuscriptor,
    });
    console.log(
      `Suscriptor: ${suscriptor.nombre}El array de pagos es: ${arrayPagosSuscriptor}`
    );
  } catch (error) {
    console.log(error);
  }
};

const obtenerSuscriptorBySocio = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { id } = req.params;
  const suscriptor = await Suscriptor.find()
    .where("socio")
    .equals(req.body.socio);
  console.log(suscriptor);

  if (!suscriptor) {
    const error = new Error("Suscriptor No Encontrado");
    console.log(error);
    return res.status(404).json({ msg: error.message });
  }

  if (!suscriptor) {
    const error = new Error("Ningun Suscriptor se ha encontrado");
    console.log(error);
    return res.status(404).json({ msg: error.message });
  }

  if (suscriptor.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No eres el creador de este Suscriptor");
    console.log(error);
    return res.status(401).json({ msg: error.message });
  }

  res.json(suscriptor);
  console.log(suscriptor.nombre, suscriptor._id);
};

const crearSuscriptor = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const suscriptor = new Suscriptor(req.body);

  suscriptor.socio = generarNumeroSocio();
  suscriptor.creador = req.usuario._id;
  suscriptor.informacionPersonal.domicilio = req.body.domicilio;
  suscriptor.informacionPersonal.correo = req.body.correo;
  suscriptor.informacionPersonal.celular = req.body.celular;
  suscriptor.informacionPersonal.dni = req.body.dni;
  suscriptor.informacionPersonal.notas = req.body.notas;
  suscriptor.informacionPersonal.genero = req.body.genero;

  suscriptor.informacionPersonal.fechaNacimiento = new Date(
    req.body.fechaNacimiento
  ).toLocaleDateString(("es-AR", { timeZone: "America/Argentina" }));

  console.log(`El usuario creador es: ${req.usuario.nombre}`);

  try {
    const suscriptorAlmacenado = await suscriptor.save();
    console.log(suscriptorAlmacenado.nombre);
    res.json(suscriptorAlmacenado);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

const editarSuscriptorId = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { usuario } = req;
  const { id } = req.params;
  const suscriptor = await Suscriptor.findById(id);

  if (!suscriptor) {
    const error = new Error("suscriptor No Encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (suscriptor.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "No puede editar, no eres el creador de este suscriptor"
    );
    console.log(error);
    return res.status(401).json({ msg: error.message });
  }

  suscriptor.nombre = req.body.nombre || suscriptor.nombre;
  suscriptor.informacionPersonal.domicilio =
    req.body.domicilio || suscriptor.informacionPersonal.domicilio;
  suscriptor.informacionPersonal.celular =
    req.body.celular || suscriptor.informacionPersonal.celular;
  suscriptor.informacionPersonal.dni =
    req.body.dni || suscriptor.informacionPersonal.dni;
  suscriptor.informacionPersonal.fechaNacimiento =
    req.body.fechaNacimiento || suscriptor.informacionPersonal.fechaNacimiento;
  suscriptor.informacionPersonal.genero =
    req.body.genero || suscriptor.informacionPersonal.genero;
  suscriptor.informacionPersonal.correo =
    req.body.correo || suscriptor.informacionPersonal.correo;
  suscriptor.informacionPersonal.notas =
    req.body.notas || suscriptor.informacionPersonal.notas;

  suscriptor.tipoSuscripcion =
    req.body.tipoSuscripcion || suscriptor.tipoSuscripcion._id;

  suscriptor.fechas.fechaVencimientoSuscripcion =
    new Date(req.body.fechaVencimientoSuscripcion) ||
    suscriptor.fechas.fechaVencimientoSuscripcion;

  console.log(hoyFormateado);
  // if (suscriptor.fechas.fechaVencimientoSuscripcion <= hoyFormateado) {
  //   suscriptor.estado = "Deudor";
  //   console.log("Cambio a Deudor");
  // } else if (suscriptor.fechas.fechaVencimientoSuscripcion > hoyFormateado) {
  //   console.log(hoyFormateado);

  //   suscriptor.estado = "Activo";
  //   console.log("Cambio a Activo");
  // }
  verificarEstadoDeDeuda(usuario);
  // suscriptor.rutina = req.body.rutina || suscriptor.rutina;

  try {
    const suscriptorAlmacenado = await suscriptor.save();
    res.json(suscriptorAlmacenado);
    console.log("Editaste a :" + suscriptorAlmacenado.nombre);
  } catch (error) {
    console.log(error);
  }
};

const editarRutina = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const suscriptor = await Suscriptor.findOneAndUpdate(id);

  if (!suscriptor) {
    const error = new Error("suscriptor No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  // suscriptor.rutina = req.body.rutina || suscriptor.rutina;

  try {
    const id = req.params.id;
    const updates = req.body;
    const options = { new: true };

    const result = await Suscriptor.findByIdAndUpdate(id, updates, options);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const PostEjercicioDeRutina = async (req, res) => {
  const { id } = req.params;
  const { ejercicio, repeticiones, dias, series } = req.body.objeto; // Desde frontend
  // const { ejercicio, repeticiones, dias } = req.body; // desde PostMan

  // let ejericioId = ejercicio;

  const suscriptor = await Suscriptor.findById(id);
  const { rutina } = suscriptor;
  console.log(suscriptor.nombre);
  const nombreEjercicio = await Ejercicio.findById(ejercicio);

  // Crear Ejercicio
  const nuevoEjercicio = {
    ejercicio: ejercicio,
    nombreEjercicio: nombreEjercicio.nombre,
    repeticiones: repeticiones,
    dias: dias,
    series: series,
  };

  // // Pushearlo a la rutina
  const a = await rutina.push(nuevoEjercicio);

  try {
    const ejericicoAgregado = await suscriptor.save();
    res.json({ msg: ejericicoAgregado.rutina });
    console.log(ejericicoAgregado.rutina);
  } catch (error) {
    console.log(error);
  }
};

const EliminarEjercicioDeRutina = async (req, res) => {
  const { id } = req.params;
  const { ejercicio } = req.query;
  let ejericioId = ejercicio;

  const suscriptor = await Suscriptor.findById(id);
  const { rutina } = suscriptor;

  if (!ejericioId) {
    res.json({ msg: "No hay ningun ejercicio con ese nombre" });
    return;
  } else if (rutina.length < 1) {
    res.json({
      msg: "La rutina esta vacia de ejercicios o falta no esta correcto el dueño del ejericico",
    });
    return;
  }

  // function buscarEjercicio(e) {
  //   return (e.ejericio = ejericioId);
  // }

  // let indexElementoAEliminar = rutina.findIndex(buscarEjercicio);
  // console.log(indexElementoAEliminar);

  // if (indexElementoAEliminar < 0) {
  //   res.json({ msg: "No existe este ejercicio" });
  //   return;
  // }

  // const removeElement = function (array, index) {
  //   let newArray = [...array];
  //   newArray.splice(index, 1);
  //   return newArray;
  // };
  // let newArray = removeElement(rutina, indexElementoAEliminar);

  // suscriptor.rutina = newArray;

  try {
    // const nuevoArray = await suscriptor.save();
    // console.log(nuevoArray.rutina);
    // res.json({ msg: nuevoArray.rutina });
  } catch (error) {
    console.log(error);
  }
};

const eliminarSuscriptorId = async (req, res) => {
  const { id } = req.params;

  const suscriptor = await Suscriptor.findById(id);

  if (!suscriptor) {
    const error = new Error("Ningun suscriptor se ha encontrado");
    console.log(error);
    return res.status(404).json({ msg: error.message });
  }

  if (suscriptor.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "No tienes permiso para eliminarr a este suscriptor"
    );
    console.log(error);
    return res.status(401).json({ msg: error.message });
  }

  try {
    await suscriptor.deleteOne();
    res.json({ msg: `Suscriptor ${suscriptor.nombre} Eliminado` });
    console.log(`Suscriptor ${suscriptor.nombre} Eliminado`);
  } catch (error) {
    console.log(error);
  }
};

const verificarEstadoDeDeudas = async (req, res) => {
  const { usuario } = req;

  verificarEstadoDeDeuda(usuario);
  try {
    res.json("ok");
  } catch (error) {
    console.log(error);
  }
};

// const verificarEstadoDeDeuda = async (usuario) => {
//   let creador = { creador: usuario };
//   console.log("Dia de hoy: " + hoyFormateado);
//   // hoy.setHours(hoy.getHours() + 3);

//   let suscriptoresTotales = await Suscriptor.find(creador).count();
//   let suscriptoresActivos = await Suscriptor.find(creador)
//     .where("estado")
//     .equals("Activo")
//     .count();
//   let suscriptoresDeudores = await Suscriptor.find(creador)
//     .where("estado")
//     .equals("Deudor")
//     .count();

//   let resultado =
//     "Totales " +
//     suscriptoresTotales +
//     " Activos: " +
//     suscriptoresActivos +
//     " Deudores: " +
//     suscriptoresDeudores;

//   console.log(resultado);

//   await Suscriptor.updateMany(
//     {
//       $and: [
//         {
//           "fechas.fechaVencimientoSuscripcion": {
//             $gte: hoyFormateado,
//           },
//         },
//         { creador: usuario._id },
//       ],
//     },
//     { $set: { estado: "Activo" } }
//   );

//   await Suscriptor.updateMany(
//     {
//       $and: [
//         {
//           "fechas.fechaVencimientoSuscripcion": {
//             $lt: hoyFormateado,
//           },
//         },
//         { creador: usuario._id },
//       ],
//     },
//     { $set: { estado: "Deudor" } }
//   );

//   let ActualizadoSuscriptoresActivos = await Suscriptor.find(creador)
//     .where("estado")
//     .equals("Activo")
//     .count();
//   let ActualizadoSuscriptoresDeudores = await Suscriptor.find(creador)
//     .where("estado")
//     .equals("Deudor")
//     .count();
//   let nuevoResultado =
//     "Nuevos activos: " +
//     ActualizadoSuscriptoresActivos +
//     "Nuevos Deudores: " +
//     ActualizadoSuscriptoresDeudores;

//   try {
//     console.log(nuevoResultado);
//     // res.json({ msg: nuevoResultado });
//   } catch (error) {
//     console.log(error);
//   }
// };

export {
  obtenerSuscriptores,
  obtenerSuscriptorId,
  obtenerSuscriptorBySocio,
  crearSuscriptor,
  editarSuscriptorId,
  eliminarSuscriptorId,
  PostEjercicioDeRutina,
  editarRutina,
  EliminarEjercicioDeRutina,
  verificarEstadoDeDeudas,
};
