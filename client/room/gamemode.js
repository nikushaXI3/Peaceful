// импортируем модули
import { Build, BuildBlocksSet, BreackGraph, GameMode, Damage, Spawns, Inventory, Teams, Timers, Ui, Properties } from 'pixel_combats/room';
import { Color } from 'pixel_combats/basic';

// переменные
const admin = Properties.GetContext().Get('admin').Value = '2F1955AAE64508B9FC31765F7E136211849DACAB95C5A86F', banned = Properties.GetContext().Get('banned').Value = 'C925816BE50844A99B94CBC25664BD6D';

// настройки
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool('BREAKING');
Build.GetContext().FlyEnable.Value = GameMode.Parameters.GetBool('PLS_FLIGHT');
Damage.GetContext().DamageOut.Value = false;
BreackGraph.PlayerBlockBoost = true;
BreackGraph.BreackAll = true;
Spawns.GetContext().RespawnTime.Value = 0;

// строительные свойства
['Pipette', 'BalkLenChange', 'BuildModeEnable', 'CollapseChangeEnable'].forEach(item => Build.GetContext()[item].Value = true);

// конфигурация инвентаря
['Secondary', 'Explosive', 'Melee', 'Build', 'Main'].forEach(item => Inventory.GetContext()[item].Value = false);

// основные команды
const BLUE_TEAM = GameMode.Parameters.GetBool('BLUE_TEAM'), RED_TEAM = GameMode.Parameters.GetBool('RED_TEAM');
           BLUE_TEAM || !BLUE_TEAM && !RED_TEAM ? 
         (
                Teams.Add('BLUE', '<size=17><b>B</b></size><size=14>lue</size>\n', new Color(10/255, 96/255, 209/255, 0)),
                Teams.Get('BLUE').Spawns.SpawnPointsGroups.Add(1)
         ) : null;

           RED_TEAM || !RED_TEAM && !BLUE_TEAM ? 
         (
                Teams.Add('RED', '<size=17><b>R</b></size><size=14>ed</size>\n', new Color(255/255, 0, 51/255, 0)),
                Teams.Get('RED').Spawns.SpawnPointsGroups.Add(2)
         ) : null;

// вход в команду по запросу
Teams.OnRequestJoinTeam.Add((player, team) => {
     team.Add(player);
     if (!admin.includes(player.id)) return;
         player.Build.FlyEnable.Value = true;
         player.Build.BuildRangeEnable.Value = true;
});
// спавн по входу в команду
Teams.OnPlayerChangeTeam.Add((player) => {
     player.Spawns.Spawn();
     if (banned.indexOf(player.id) == -1) return;
         player.Spawns.Despawn();
});

// бессмертие после спавна
Spawns.GetContext().OnSpawn.Add((player) => {
     player.Damage.DamageIn.Value = false;
     player.Timers.Get('immortality').Restart(2);
});

// респавн после конца таймера
Damage.OnDeath.Add((player) => {
     player.Properties.Get('respawn').Value = 40;
     player.Timers.Get('respawn').Restart(1);
});
// основы инвентаря после добовления команд
Teams.OnAddTeam.Add((team) => {
     const BLUE_UNARMED = GameMode.Parameters.GetBool('BLUE_UNARMED'), RED_UNARMED = GameMode.Parameters.GetBool('RED_UNARMED');
     const teamsToUpdate = ['BLUE', 'RED'], itemsToUpdate = ['Melee', 'Build', 'BuildInfinity'];

     teamsToUpdate.forEach(teamTag => {
             if (Teams.Contains(teamTag)) itemsToUpdate.forEach(item => Teams.Get(teamTag).Inventory[item].Value = (teamTag != 'RED' ? !BLUE_UNARMED : !RED_UNARMED) ? true : false);
     });

     team.Build.BlocksSet.Value = BuildBlocksSet.AllClear;
     if (GameMode.Parameters.GetBool('SPEED_X2')) team.ContextedProperties.BuildSpeed.Value = 2;
});

// таймер
Timers.OnPlayerTimer.Add((timer) => {
    const player = timer.Player;

    switch (timer.id) {
        case 'immortality':
            player.Damage.DamageIn.Value = true;
            break;
            
        case 'respawn':
            if (!player.IsAlive) {
            const properties = player.Properties.Get('respawn');
                properties.Value -= 1;
                player.Ui.Hint.Value = `\nАвтореспавн через ${properties.Value}`;
                properties.Value <= 0 ?
                (
                    player.Spawns.Spawn(),
                    player.Ui.Hint.Reset()
                ) :
                    timer.Restart(1);
            } else {
                 timer.Stop();
                 player.Ui.Hint.Reset();
            }
            break;
    }
});

// подсказка
Ui.GetContext().Hint.Value = '\nЗастраивайте базу';
