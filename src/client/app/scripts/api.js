function imageGenerator() {
  return {
    prompt: "",
    imageUrl: "",
    showDropdown: false,
    aspectOptions: ['1:1','16:9','21:9','3:2','2:3','4:5','5:4','3:4','4:3','9:16','9:21'],
    selectedAspect: '1:1',
    num_outputs: 1,
    isGenerating: false,
    
    async generate() {
      if (!this.prompt.trim()) {
        alert("Please enter a prompt.");
        return;
      }
      
      this.isGenerating = true;
      
      const requestData = {
        prompt: this.prompt,
        aspect_ratio: this.selectedAspect,
        num_outputs: this.num_outputs
      };
      
      try {
        const response = await fetch("/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error generating image");
        }
        
        // Parse the response which contains record IDs
        const data = await response.json();
        
        // Refresh the gallery by triggering the fetchImages method on the gallery component
     window.location.reload()
        
      } catch (error) {
        console.error("Error generating image:", error);
        alert("An error occurred while generating the image.");
      } finally {
        this.isGenerating = false;
      }
    },
    
    clearPrompt() {
      this.prompt = "";
    },
    
    handleEnter(e) {
      // Allow Shift+Enter for new lines.
      if (e.shiftKey) return;
      e.preventDefault();
      this.generate();
    }
  };
}