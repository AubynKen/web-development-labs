const settingButton = document.getElementById("btn-setting");
const returnButton = document.getElementById("btn-return");
const infoSection = document.getElementsByClassName("info")[0];
const settingSection = document.getElementsByClassName("info-setting")[0];

settingButton.addEventListener("click", e => {
  e.preventDefault();
  infoSection.style.display = "none"; // hide info panel
  settingSection.style.display = "block"; // show setting panel
});

returnButton.addEventListener("click", e => {
  e.preventDefault();
  settingSection.style.display = "none";
  infoSection.style.display = "block";
});