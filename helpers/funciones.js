import Suscriptor from "../models/Suscriptor.js";

export let hoy = new Date();
export let hoyFormateado = hoy.toISOString().split("T")[0];
export const verificarEstadoDeDeuda = async (usuario) => {
  let creador = { creador: usuario };
  console.log("Dia de hoy: " + hoyFormateado);
  // hoy.setHours(hoy.getHours() + 3);

  let suscriptoresTotales = await Suscriptor.find(creador).count();
  let suscriptoresActivos = await Suscriptor.find(creador)
    .where("estado")
    .equals("Activo")
    .count();
  let suscriptoresDeudores = await Suscriptor.find(creador)
    .where("estado")
    .equals("Deudor")
    .count();

  let resultado =
    "Totales " +
    suscriptoresTotales +
    " Activos: " +
    suscriptoresActivos +
    " Deudores: " +
    suscriptoresDeudores;

  console.log(resultado);

  await Suscriptor.updateMany(
    {
      $and: [
        {
          "fechas.fechaVencimientoSuscripcion": {
            $gte: hoyFormateado,
          },
        },
        { creador: usuario._id },
      ],
    },
    { $set: { estado: "Activo" } }
  );

  await Suscriptor.updateMany(
    {
      $and: [
        {
          "fechas.fechaVencimientoSuscripcion": {
            $lt: hoyFormateado,
          },
        },
        { creador: usuario._id },
      ],
    },
    { $set: { estado: "Deudor" } }
  );

  let ActualizadoSuscriptoresActivos = await Suscriptor.find(creador)
    .where("estado")
    .equals("Activo")
    .count();
  let ActualizadoSuscriptoresDeudores = await Suscriptor.find(creador)
    .where("estado")
    .equals("Deudor")
    .count();
  let nuevoResultado =
    "Nuevos activos: " +
    ActualizadoSuscriptoresActivos +
    "Nuevos Deudores: " +
    ActualizadoSuscriptoresDeudores;

  try {
    console.log(nuevoResultado);
    // res.json({ msg: nuevoResultado });
  } catch (error) {
    console.log(error);
  }
};
export const generarId = () => {
  const random = Math.random().toString(32).substring(2);
  const fecha = Date.now().toString(32);
  return random + fecha;
};

export const generarNumeroSocio = () => {
  var aleatorio = Math.round(Math.random() * 999999);
  return aleatorio;
};

export default {
  hoy,
  hoyFormateado,
  generarId,
  generarNumeroSocio,
  verificarEstadoDeDeuda,
};

// export const ordenarAZ = (array) => {
//   // array.sort(a, b)
//   // var numbers = [4, 2, 5, 1, 7];

//   array.sort(function (a, b) {
//     return a - b;
//   });
// };

// ordenarAZ([4, 2, 5, 1, 7]);
