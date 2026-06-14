import cv2
import requests
import numpy as np
import threading

# ==========================================
# CONFIGURACIÓN
# ==========================================

TOKEN = "0a812161937ea3271ea984f6ba7ccd41ea0686c2"

AUTORIZADAS = {
    "A1B234",
    "AUJ903"
}

UMBRAL_CAMBIO = 25000

# ==========================================
# VARIABLES GLOBALES
# ==========================================

estado = "ESPERANDO"

api_ocupada = False
resultado_placa = None

# ==========================================
# PLATE RECOGNIZER
# ==========================================

def detectar_placa(imagen):

    try:

        with open(imagen, "rb") as fp:

            response = requests.post(
                "https://api.platerecognizer.com/v1/plate-reader/",
                files={"upload": fp},
                headers={"Authorization": f"Token {TOKEN}"},
                timeout=20
            )

        data = response.json()

        print("\nRespuesta API:")
        print(data)

        if "results" not in data:
            return None

        if len(data["results"]) == 0:
            return None

        return data["results"][0]["plate"].upper()

    except Exception as e:
        print("Error API:", e)
        return None

# ==========================================
# HILO DE CONSULTA
# ==========================================

def analizar_placa(frame):

    global api_ocupada
    global resultado_placa

    cv2.imwrite("captura.jpg", frame)

    resultado_placa = detectar_placa("captura.jpg")

    api_ocupada = False

# ==========================================
# INICIO CÁMARA
# ==========================================

cam = cv2.VideoCapture(0)

if not cam.isOpened():
    print("No se pudo abrir la cámara")
    exit()

print("Retira cualquier hoja de la cámara")
print("Capturando fondo base...")

for _ in range(30):
    ret, frame = cam.read()

frame_base = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

print("\nSistema iniciado")
print("Estado: ESPERANDO\n")

placa_mostrada = None

# ==========================================
# LOOP PRINCIPAL
# ==========================================

while True:

    ret, frame = cam.read()

    if not ret:
        continue

    gris = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    diferencia = cv2.absdiff(frame_base, gris)

    pixeles_cambiados = np.sum(diferencia > 25)

    # ======================================
    # ESTADO ESPERANDO
    # ======================================

    if estado == "ESPERANDO":

        cv2.putText(
            frame,
            "Esperando vehiculo...",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        if pixeles_cambiados > UMBRAL_CAMBIO:

            print("Objeto detectado")

            estado = "ANALIZANDO"

            resultado_placa = None

            api_ocupada = True

            threading.Thread(
                target=analizar_placa,
                args=(frame.copy(),),
                daemon=True
            ).start()

    # ======================================
    # ESTADO ANALIZANDO
    # ======================================

    elif estado == "ANALIZANDO":

        cv2.putText(
            frame,
            "Analizando placa...",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2
        )

        if not api_ocupada:

            if resultado_placa is not None:

                placa_mostrada = resultado_placa

                print("\n========================")
                print("PLACA:", placa_mostrada)

                if placa_mostrada in AUTORIZADAS:
                    print("ESTADO: AUTORIZADO")
                    print("BARRERA: ABIERTA")
                else:
                    print("ESTADO: DENEGADO")
                    print("BARRERA: CERRADA")

                print("========================\n")

                estado = "AUTORIZADO"

            else:

                print("No se detectó ninguna placa")

                estado = "ESPERANDO"

    # ======================================
    # ESTADO AUTORIZADO
    # ======================================

    elif estado == "AUTORIZADO":

        texto = f"PLACA: {placa_mostrada}"

        cv2.putText(
            frame,
            texto,
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        if placa_mostrada in AUTORIZADAS:

            cv2.putText(
                frame,
                "AUTORIZADO",
                (20, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

        else:

            cv2.putText(
                frame,
                "DENEGADO",
                (20, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

        # Si desaparece la hoja

        if pixeles_cambiados < (UMBRAL_CAMBIO * 0.3):

            print("Vehiculo ingresó")
            print("Esperando siguiente vehiculo...\n")

            placa_mostrada = None
            estado = "ESPERANDO"

    # ======================================
    # MOSTRAR VENTANA
    # ======================================

    cv2.imshow("SecGuard Logistics", frame)

    tecla = cv2.waitKey(1)

    if tecla == 27:
        break

cam.release()
cv2.destroyAllWindows()