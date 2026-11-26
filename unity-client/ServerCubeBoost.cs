using UnityEngine;

/// <summary>
/// Модуль 1: «Тотем Сервера» на площади.
/// ВАЖНО: вешай на отдельный Cube посреди площади (назови его ServerCube),
/// чтобы вращение и невесомость не мешали WASD-управлению твоего игрока!
/// </summary>
public class ServerCubeBoost : MonoBehaviour
{
    public float baseSpinSpeed = 45f;
    public bool autoSyncEvery3Seconds = true;
    public bool spinObject = true;
    public bool floatOnMoonGravity = true;

    private float currentMultiplier = 2f;
    private bool isLowGravity = false;
    private Vector3 targetScale = Vector3.one;
    private Vector3 basePosition;
    private float syncTimer = 0f;

    private void Start()
    {
        basePosition = transform.position;
        SyncWorld();
    }

    private void Update()
    {
        if (spinObject)
        {
            transform.Rotate(Vector3.up, baseSpinSpeed * currentMultiplier * Time.deltaTime);
        }

        transform.localScale = Vector3.Lerp(transform.localScale, targetScale, Time.deltaTime * 6f);

        if (floatOnMoonGravity)
        {
            float targetY = isLowGravity
                ? basePosition.y + 1.25f + Mathf.Sin(Time.time * 2.5f) * 0.35f
                : basePosition.y;
            Vector3 nextPos = new Vector3(transform.position.x, targetY, transform.position.z);
            transform.position = Vector3.Lerp(transform.position, nextPos, Time.deltaTime * 4f);
        }

        if (Input.GetKeyDown(KeyCode.R))
        {
            SyncWorld();
        }

        if (autoSyncEvery3Seconds)
        {
            syncTimer += Time.deltaTime;
            if (syncTimer >= 3f)
            {
                syncTimer = 0f;
                SyncWorld();
            }
        }
    }

    public void SyncWorld()
    {
        ServerBridge.Instance.GetWorldState((world) =>
        {
            currentMultiplier = world.expMultiplier;
            isLowGravity = world.lowGravity;

            float s = Mathf.Clamp(world.cubeScale, 0.3f, 4f);
            targetScale = new Vector3(s, s, s);
            Physics.gravity = new Vector3(0f, world.gravityY, 0f);

            Color parsedColor = Color.yellow;
            if (!string.IsNullOrEmpty(world.cubeColorHex))
            {
                ColorUtility.TryParseHtmlString(world.cubeColorHex, out parsedColor);
            }

            var rend3D = GetComponentInChildren<Renderer>();
            if (rend3D != null) rend3D.material.color = parsedColor;

            var rend2D = GetComponentInChildren<SpriteRenderer>();
            if (rend2D != null) rend2D.color = parsedColor;
        });
    }
}
