# 🔗 Connection Configuration

## 🌐 Web Service (Render API)

```text
https://agri-iot-webservice.onrender.com
```

---

## 🔐 API Key

```text
x7F9$kL2@vQ8#ZpR4!mN6&cT1^aD0*HsJ9uW3eY5
```

---

## 📶 WiFi Configuration (ESP32 Upload Mode)

```text
SSID: Abdou-Phone
Password: 12345678
```

---

## 📌 Notes

- ESP32 connects to this WiFi only during data upload.
- API endpoint will be used for sending collected sensor data.
- Ensure internet is available on the hotspot during upload.
- API Key must be included in request header:

```http
x-api-key: <API_KEY>
```
