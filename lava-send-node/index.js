// Mengimpor library fs untuk membaca file
const fs = require("fs");

// Mengimpor library near-api-js
const nearAPI = require("near-api-js");
// Mengimpor fungsi dan objek yang diperlukan dari near-api-js
const { connect, KeyPair, keyStores, utils } = nearAPI;

// Konfigurasi akun pengirim, id jaringan, jumlah NEAR yang akan dikirim, dan kunci privat
const sender =
  "orangbawah.testnet"; // Ganti alamat Pengirim
const networkId = "testnet";
const amount = utils.format.parseNearAmount("0.001"); // Jumlah token NEAR yang dikirim
const nodeUrl =
  "https://near-testnet.lava.build/lava-referer-b302d6af-a4fb-44a4-9a2a-941fb55efe6a/";

// Fungsi untuk membaca privateKey dari file privatekey.txt
function readPrivateKey() {
  try {
    return fs.readFileSync("privatekey.txt", "utf8").trim();
  } catch (error) {
    console.error("Gagal membaca file privatekey.txt:", error);
    return null;
  }
}

// Fungsi untuk mengirim transaksi ke alamat penerima tertentu
async function sendTransaction(receiver) {
  // Mendapatkan privateKey dari file
  const privateKey = readPrivateKey();
  if (!privateKey) return;

  // Membuat objek keyStore kosong di dalam memori menggunakan near-api-js
  const keyStore = new keyStores.InMemoryKeyStore();
  // Membuat keyPair dari kunci privat yang telah disediakan
  const keyPair = KeyPair.fromString(privateKey);
  // Menambahkan key yang baru dibuat ke dalam keyStore yang dapat menampung beberapa key
  await keyStore.setKey(networkId, sender, keyPair);

  // Konfigurasi yang digunakan untuk terhubung ke NEAR
  const config = {
    networkId,
    keyStore,
    nodeUrl,
    walletUrl: "https://testnet.mynearwallet.com/",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
  };

  // Terhubung ke NEAR
  const near = await connect(config);
  // Membuat objek akun NEAR
  const senderAccount = await near.account(sender);

  try {
    // Menggunakan utilitas near-api-js untuk mengonversi yoctoNEAR kembali menjadi floating point
    console.log(`Mengirim ${utils.format.formatNearAmount(amount)} $NEAR`);
    console.log(``);
    console.log(`dari ${sender}`);
    console.log(`ke ${receiver}`);
    // Mengirim token tersebut
    const result = await senderAccount.sendMoney(receiver, amount);
    // Menampilkan hasil transaksi
    console.log(``);
    console.log("Hasil Transaksi: ", result.transaction);
    console.log(``);
    // Menampilkan tautan ke NEAR Explorer untuk melihat transaksi
    console.log("TX HASH");
    console.log(`${config.explorerUrl}/txns/${result.transaction.hash}`);
    console.log(``);
  } catch (error) {
    // Mengembalikan error jika tidak berhasil
    console.error(error);
  }
}

// Fungsi untuk mengulangi pengiriman transaksi tanpa batas ke semua alamat penerima dalam file receivers.txt
async function repeatTransactions() {
  while (true) {
    try {
      // Baca file receivers.txt untuk mendapatkan daftar alamat penerima
      const receivers = fs.readFileSync("receivers.txt", "utf8").split("\n");
      for (const receiver of receivers) {
        // Jika receiver tidak kosong, kirim transaksi ke receiver
        if (receiver.trim() !== "") {
          await sendTransaction(receiver.trim());
          console.log("Jeda 45 detik...");
          console.log(``);
          console.log("----------------------------------------------------");
          console.log(``);
          await new Promise((resolve) => setTimeout(resolve, 45000)); // Penundaan 30 detik
        }
      }
    } catch (error) {
      console.error("Gagal membaca file receivers.txt:", error);
    }
  }
}

// Menjalankan fungsi untuk mengulangi transaksi tanpa batas
repeatTransactions();
