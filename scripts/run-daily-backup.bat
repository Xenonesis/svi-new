@echo off
cd /d "C:\Users\Acer\Desktop\svi-new"
echo ==================================================== >> "C:\Users\Acer\Desktop\svi-new\backups\backup_automation.log"
echo [Backup Started: %date% %time%] >> "C:\Users\Acer\Desktop\svi-new\backups\backup_automation.log"
"C:\Users\Acer\AppData\Local\pi-node\current\node.exe" "C:\Users\Acer\Desktop\svi-new\scripts\export-supabase-backup.mjs" >> "C:\Users\Acer\Desktop\svi-new\backups\backup_automation.log" 2>&1
echo [Backup Finished: %date% %time%] >> "C:\Users\Acer\Desktop\svi-new\backups\backup_automation.log"
echo ==================================================== >> "C:\Users\Acer\Desktop\svi-new\backups\backup_automation.log"
