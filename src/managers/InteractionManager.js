

export class InteractionManager
{
    constructor(setShowPopup, setPopupContent, goToSceneZone, playAnimation, playSound)
    {
        this.interactables = [];
        this.setShowPopup = setShowPopup;
        this.setPopupContent = setPopupContent;
        this.goToSceneZone = goToSceneZone;
        this.playAnimation = playAnimation;
        this.playSound = playSound;

        this.handleInteraction = async (event) =>
        {
            document.body.style.cursor = "pointer";
            event.stopPropagation();

            const type = event.object.userData.interactableType;
            const data = event.object.userData.interactableData;

            const hasSoundTrigger = event.object.userData?.mediaTrigger == "OnSelect";

            const actions = event.object.userData.OnSelectAnimations || null;
            const animationPromises = [];

            if (actions != null)
            {
                actions.forEach((actionName) =>
                {
                    animationPromises.push(this.playAnimation(actionName));
                });
            }


            if (hasSoundTrigger) 
            {
                this.playSound(event.object);
            }

            await Promise.all(animationPromises);


            switch (type)
            {
                case "Popup HTML":
                    this.setShowPopup(true);
                    this.setPopupContent(data);
                    break;

                case "Open Link":
                    window.open(data, "_blank");
                    break;

                case "Go To Scene Zone":
                    this.goToSceneZone(data);
                    break;

                default:
                    break;
            }
        }

        // on hover callback for playing any hover animations found inside the userData varaiable under hoverAnimations
        this.handlePointerEnter = (event) =>
        {

            document.body.style.cursor = "pointer";

            const actions = event.object.userData.OnPointerEnterAnimations || null;
            if (actions != null)
            {
                actions.forEach((actionName) =>
                {
                    this.playAnimation(actionName);
                });
            }

            const hasSoundTrigger = event.object.userData?.mediaTrigger == "OnPointerEnter";
            if (!hasSoundTrigger) return;

            this.playSound(event.object);

        }

        this.handlePointerExit = (event) =>
        {

            document.body.style.cursor = "auto";

            const actions = event.object.userData.OnPointerExitAnimations || null;
            if (actions != null)
            {
                actions.forEach((actionName) =>
                {
                    this.playAnimation(actionName);
                });
            }

            const hasSoundTrigger = event.object.userData?.mediaTrigger == "OnPointerExit";

            if (!hasSoundTrigger) return;
            this.playSound(event.object);

        }


    }
}
