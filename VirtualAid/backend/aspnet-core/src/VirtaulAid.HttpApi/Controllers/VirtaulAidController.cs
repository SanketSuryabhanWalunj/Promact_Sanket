using VirtaulAid.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace VirtaulAid.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class VirtaulAidController : AbpControllerBase
{
    protected VirtaulAidController()
    {
        LocalizationResource = typeof(VirtaulAidResource);
    }
}
