
![Slide 16_9 - 1](https://github.com/user-attachments/assets/616184ce-1cd5-445e-8efa-9b6746d37f0e)

<h1>Plugin: Bulk Certificate Generator for Figma </h1>
This plugin was created as part of a practical assignment for the Multimedia Technology degree at Universidad Maimónides, within the course Multimedia Programming IV.

<br>

It allows users to automatically generate personalized certificates in Figma using data loaded from a public Google Sheets spreadsheet.

It is designed to automate the creation of certificates, diplomas, or other repetitive documents, starting from a single base design and filling in each person’s information.

<h2>How does the plugin work?</h2>
<ol>
  <li>You design a base certificate in Figma, using text layers named with special tags like #NAME, #COURSE, #DATE, etc.</li>
  <li>You load a public Google Sheet that contains the data to use (each row = one certificate).</li>
  <li>The plugin reads the data, clones your base design, replaces the fields with values from the sheet, and automatically places the certificates on the canvas.</li>
</ol>


<h2>Technologies used</h2>
<ul>
  <li>Figma Plugin API</li>
  <li>HTML + CSS for the user interface</li>
  <li>TypeScript for plugin logic</li>
  <li>OpenSheet API to easily access Google Sheets data as JSON</li>
  
</ul>

<br>
<p align="left">
<img src="https://img.shields.io/badge/STATUS-EN%20DESAROLLO-green">
<img src="https://img.shields.io/github/stars/angelesrveron?style=social">
  
</p>







