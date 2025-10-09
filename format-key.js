const fs = require("fs");

// GANTI NAMA FILE INI dengan nama file .json yang Anda download dari Firebase
const keyFileName = "D:/road-damage-firebase.json";

try {
  // Baca file .json sebagai teks biasa
  const fileContent = fs.readFileSync(keyFileName, "utf8");

  // Stringify konten tersebut. Ini akan secara otomatis meng-escape semua karakter
  // yang bermasalah (seperti \n menjadi \\n) dan membungkus semuanya dalam tanda kutip.
  const formattedString = JSON.stringify(fileContent);

  // Cetak hasilnya ke konsol
  console.log(formattedString);
} catch (error) {
  console.error(
    `Error: Pastikan file bernama "${keyFileName}" ada di folder yang sama dengan skrip ini.`
  );
}
