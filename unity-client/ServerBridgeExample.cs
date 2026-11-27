using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Модуль 3 (по желанию): Отображение текста сервера и Босса на UI -> Legacy -> Text.
/// </summary>
public class ServerBridgeExample : MonoBehaviour
{
    [Header("Ссылки на Legacy UI Text (UI -> Legacy -> Text)")]
    public Text statusLabel;
    public Text motdLabel;

    private void Start() => RequestServerData();

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.R)) RequestServerData();
    }

    public void RequestServerData()
    {
        ServerBridge.Instance.GetServerStatus((statusData) =>
        {
            Debug.Log($"<color=#22c55e>[БЭКЕНД УСПЕХ]</color> {statusData.status.ToUpper()} | Игроков: {statusData.activePlayers}");
            if (statusLabel != null) statusLabel.text = $"ONLINE • Игроков: {statusData.activePlayers} • {statusData.uptimeSeconds}s";
        },
        (error) =>
        {
            Debug.LogError($"<color=#ef4444>[БЭКЕНД ОШИБКА]</color> {error}");
            if (statusLabel != null) statusLabel.text = "OFFLINE";
        });

        ServerBridge.Instance.GetWorldState((world) =>
        {
            Debug.Log($"<color=#38bdf8>[МИР]</color> {world.title}: {world.motd} (x{world.expMultiplier}, scale={world.cubeScale})");
            if (motdLabel != null) motdLabel.text = $"{world.title}\n{world.motd}\nБонус: x{world.expMultiplier} | Гравитация: {world.gravityY}";
        });
    }
}
